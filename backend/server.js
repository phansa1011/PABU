const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express()
app.use(express.json())

const db = new sqlite3.Database("./parkingDB.db", (err) => {
    if (err) console.error(err.message);
    console.log("Connected to SQLite DB ✅");
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        car_plate TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS parking_slots (
        slot_id INTEGER PRIMARY KEY AUTOINCREMENT,
        slot_number TEXT UNIQUE NOT NULL,
        status TEXT CHECK(status IN ('available', 'reserved')) NOT NULL DEFAULT 'available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS reservations (
        reservation_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        slot_id INTEGER NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        booking_type TEXT CHECK(booking_type IN ('hourly', 'daily', 'monthly')) NOT NULL,
        total_price REAL NOT NULL,
        status TEXT CHECK(status IN ('pending', 'confirmed', 'completed')) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(user_id),
        FOREIGN KEY(slot_id) REFERENCES parking_slots(slot_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS payments (
        payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        reservation_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        payment_method TEXT CHECK(payment_method IN ('bank_transfer', 'qr_code')) NOT NULL,
        payment_status TEXT CHECK(payment_status IN ('pending', 'verified', 'failed')) NOT NULL DEFAULT 'pending',
        proof_of_payment TEXT,
        FOREIGN KEY(reservation_id) REFERENCES reservations(reservation_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS penalties (
        penalty_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        reservation_id INTEGER NOT NULL,
        actual_exit_time TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT CHECK(status IN ('unpaid', 'paid')) NOT NULL DEFAULT 'unpaid',
        FOREIGN KEY(user_id) REFERENCES users(user_id),
        FOREIGN KEY(reservation_id) REFERENCES reservations(reservation_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS notifications (
        notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        FOREIGN KEY(user_id) REFERENCES users(user_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS barrier_control (
        control_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        slot_id INTEGER NOT NULL,
        action TEXT CHECK(action IN ('open', 'close')) NOT NULL,
        action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(user_id),
        FOREIGN KEY(slot_id) REFERENCES parking_slots(slot_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS extensions (
        extension_id INTEGER PRIMARY KEY AUTOINCREMENT,
        reservation_id INTEGER NOT NULL,
        new_end_time TEXT NOT NULL,
        additional_fee REAL NOT NULL,
        FOREIGN KEY(reservation_id) REFERENCES reservations(reservation_id)
    )`);
});

//users
// API ลงทะเบียนผู้ใช้ใหม่
app.post("/register", async (req, res) => {
    const { name, last_name, phone, email, password, car_plate } = req.body;
    const encryptedPassword = await bcrypt.hash(password, 10);
    console.log("POST: ", name, last_name, phone, email, password, car_plate);

    db.run(
        `INSERT INTO users (name, last_name, phone, email, password, car_plate) VALUES (?,?,?,?,?,?)`,
        [name, last_name, phone, email, encryptedPassword, car_plate],
        function (err) {
            if (err) return res.status(400).send({ message: "User already exists" });
            res.send({ message: "User registered" });
        }
    );
});

// API เข้าสู่ระบบ (Login)
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    console.log("Login:", email, password);

    db.get(
        `SELECT * FROM users WHERE email = ?`, [email],
        async (err, user) => {
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(400).send({ message: "Invalid credentials" });
            }
            const token = jwt.sign({ userId: user.user_id }, "secretkey");
            res.send({ token });
        }
    );
});

// API ดึงข้อมูลผู้ใช้ทั้งหมด
app.get("/users", (req, res) => {
    db.all(`SELECT * FROM users`, (err, rows) => {
        if (err) {
            return res.status(500).send({ message: "Error fetching users" });
        }
        res.send({ users: rows });
    });
});

// API ดึงข้อมูลผู้ใช้ตาม user_id
app.get("/users/:id", (req, res) => {
    const userId = req.params.id;

    db.get(`SELECT * FROM users WHERE user_id = ?`, [userId], (err, row) => {
        if (err) {
            return res.status(500).send({ message: "Error fetching user" });
        }
        if (!row) {
            return res.status(404).send({ message: "User not found" });
        }
        res.send({ user: row });
    });
});
//user
// API แก้ไขข้อมูลผู้ใช้
app.put("/users/:id", async (req, res) => {
    const userId = req.params.id;
    const { name, last_name, phone, email, password, car_plate } = req.body;

    // เข้ารหัสรหัสผ่านใหม่ (ถ้ามีการเปลี่ยนแปลง)
    let encryptedPassword = password ? await bcrypt.hash(password, 10) : null;

    db.run(
        `UPDATE users SET name = ?, last_name = ?, phone = ?, email = ?, password = ?, car_plate = ? WHERE user_id = ?`,
        [name, last_name, phone, email, encryptedPassword || password, car_plate, userId],
        function (err) {
            if (err) {
                return res.status(500).send({ message: "Error updating user" });
            }
            res.send({ message: "User updated successfully" });
        }
    );
});

// API ลบผู้ใช้ตาม user_id
app.delete("/users/:id", (req, res) => {
    const userId = req.params.id;

    db.run(`DELETE FROM users WHERE user_id = ?`, [userId], function (err) {
        if (err) {
            return res.status(500).send({ message: "Error deleting user" });
        }
        res.send({ message: "User deleted successfully" });
    });
});

//parking_slots
// API ดึงข้อมูลที่จอดรถทั้งหมด
app.get("/parking_slots", (req, res) => {
    db.all(`SELECT * FROM parking_slots`, (err, rows) => {
        if (err) {
            return res.status(500).send({ message: "Error fetching parking slots" });
        }
        res.send({ parking_slots: rows });
    });
});

// API ดึงข้อมูลที่จอดรถตาม slot_id
app.get("/parking_slots/:id", (req, res) => {
    const slotId = req.params.id;

    db.get(`SELECT * FROM parking_slots WHERE slot_id = ?`, [slotId], (err, row) => {
        if (err) {
            return res.status(500).send({ message: "Error fetching parking slot" });
        }
        if (!row) {
            return res.status(404).send({ message: "Parking slot not found" });
        }
        res.send({ parking_slot: row });
    });
});

app.put("/parking-slots/:slot_id", (req, res) => {
    const { status } = req.body;
    db.run(
        `UPDATE parking_slots SET status = ? WHERE slot_id = ?`,
        [status, req.params.slot_id],
        function (err) {
            if (err) return res.status(400).send({ message: "Error updating parking slot" });
            res.send({ message: "Parking slot updated successfully" });
        }
    );
});

//reservations
// POST /reservations: สร้างการจองที่จอดรถ
app.post("/reservations", (req, res) => {
    const { user_id, slot_id, start_time, end_time, booking_type, total_price, status } = req.body;
    const created_at = new Date().toISOString();
    
    // เช็คว่ามีข้อมูลครบหรือไม่
    if (!user_id || !slot_id || !start_time || !end_time || !booking_type || !total_price || !status) {
        return res.status(400).send({ message: "Missing required fields" });
    }

    // คำสั่ง SQL สำหรับการสร้างการจอง
    db.run(
        `INSERT INTO reservations (user_id, slot_id, start_time, end_time, booking_type, total_price, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, slot_id, start_time, end_time, booking_type, total_price, status, created_at],
        function (err) {
            if (err) return res.status(500).send({ message: "Error creating reservation" });
            res.status(201).send({ message: "Reservation created successfully", reservation_id: this.lastID });
        }
    );
});

// GET /reservations: ดึงข้อมูลการจองทั้งหมด
app.get("/reservations", (req, res) => {
    db.all("SELECT * FROM reservations", (err, rows) => {
        if (err) return res.status(500).send({ message: "Error fetching reservations" });
        res.send({ reservations: rows });
    });
});

// GET /reservations/:reservation_id: ดึงข้อมูลการจองตาม ID
app.get("/reservations/:reservation_id", (req, res) => {
    const { reservation_id } = req.params;

    db.get(`SELECT * FROM reservations WHERE reservation_id = ?`, [reservation_id], (err, row) => {
        if (err) return res.status(500).send({ message: "Error fetching reservation" });
        if (!row) return res.status(404).send({ message: "Reservation not found" });
        res.send({ reservation: row });
    });
});

// PUT /reservations/:reservation_id: แก้ไขการจอง
app.put("/reservations/:reservation_id", (req, res) => {
    const { reservation_id } = req.params;
    const { start_time, end_time, booking_type, total_price, status } = req.body;

    // เช็คว่ามีข้อมูลที่ต้องการแก้ไขหรือไม่
    if (!start_time || !end_time || !booking_type || !total_price || !status) {
        return res.status(400).send({ message: "Missing required fields" });
    }

    db.run(
        `UPDATE reservations SET start_time = ?, end_time = ?, booking_type = ?, total_price = ?, status = ? WHERE reservation_id = ?`,
        [start_time, end_time, booking_type, total_price, status, reservation_id],
        function (err) {
            if (err) return res.status(500).send({ message: "Error updating reservation" });
            if (this.changes === 0) return res.status(404).send({ message: "Reservation not found" });
            res.send({ message: "Reservation updated successfully" });
        }
    );
});

// DELETE /reservations/:reservation_id: ลบการจอง
app.delete("/reservations/:reservation_id", (req, res) => {
    const { reservation_id } = req.params;

    db.run(
        `DELETE FROM reservations WHERE reservation_id = ?`,
        [reservation_id],
        function (err) {
            if (err) return res.status(500).send({ message: "Error deleting reservation" });
            if (this.changes === 0) return res.status(404).send({ message: "Reservation not found" });
            res.send({ message: "Reservation deleted successfully" });
        }
    );
});

//Payments
// POST /payments: การชำระเงิน
app.post("/payments", (req, res) => {
    const { reservation_id, amount, payment_method, payment_status, proof_of_payment } = req.body;
    const created_at = new Date().toISOString();

    if (!reservation_id || !amount || !payment_method || !payment_status) {
        return res.status(400).send({ message: "Missing required fields" });
    }

    db.run(
        `INSERT INTO payments (reservation_id, amount, payment_method, payment_status, proof_of_payment, created_at) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [reservation_id, amount, payment_method, payment_status, proof_of_payment, created_at],
        function (err) {
            if (err) return res.status(500).send({ message: "Error processing payment" });
            res.status(201).send({ message: "Payment processed successfully", payment_id: this.lastID });
        }
    );
});

// GET /payments/:payment_id: ดึงข้อมูลการชำระเงินตาม ID
app.get("/payments/:payment_id", (req, res) => {
    const { payment_id } = req.params;

    db.get(`SELECT * FROM payments WHERE payment_id = ?`, [payment_id], (err, row) => {
        if (err) return res.status(500).send({ message: "Error fetching payment" });
        if (!row) return res.status(404).send({ message: "Payment not found" });
        res.send({ payment: row });
    });
});

// PUT /payments/:payment_id: อัพเดตสถานะการชำระเงิน
app.put("/payments/:payment_id", (req, res) => {
    const { payment_id } = req.params;
    const { payment_status } = req.body;

    if (!payment_status) {
        return res.status(400).send({ message: "Missing payment status" });
    }

    db.run(
        `UPDATE payments SET payment_status = ? WHERE payment_id = ?`,
        [payment_status, payment_id],
        function (err) {
            if (err) return res.status(500).send({ message: "Error updating payment" });
            if (this.changes === 0) return res.status(404).send({ message: "Payment not found" });
            res.send({ message: "Payment status updated successfully" });
        }
    );
});

//Penalties
// POST /penalties: การบันทึกค่าปรับ
app.post("/penalties", (req, res) => {
    const { user_id, reservation_id, actual_exit_time, amount, status } = req.body;
    const created_at = new Date().toISOString();

    if (!user_id || !reservation_id || !amount || !status) {
        return res.status(400).send({ message: "Missing required fields" });
    }

    db.run(
        `INSERT INTO penalties (user_id, reservation_id, actual_exit_time, amount, status, created_at) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id, reservation_id, actual_exit_time, amount, status, created_at],
        function (err) {
            if (err) return res.status(500).send({ message: "Error recording penalty" });
            res.status(201).send({ message: "Penalty recorded successfully", penalty_id: this.lastID });
        }
    );
});

// GET /penalties: ดึงข้อมูลค่าปรับทั้งหมด
app.get("/penalties", (req, res) => {
    db.all("SELECT * FROM penalties", (err, rows) => {
        if (err) return res.status(500).send({ message: "Error fetching penalties" });
        res.send({ penalties: rows });
    });
});

// PUT /penalties/:penalty_id: อัพเดตสถานะค่าปรับ
app.put("/penalties/:penalty_id", (req, res) => {
    const { penalty_id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).send({ message: "Missing penalty status" });
    }

    db.run(
        `UPDATE penalties SET status = ? WHERE penalty_id = ?`,
        [status, penalty_id],
        function (err) {
            if (err) return res.status(500).send({ message: "Error updating penalty" });
            if (this.changes === 0) return res.status(404).send({ message: "Penalty not found" });
            res.send({ message: "Penalty status updated successfully" });
        }
    );
});

//Notifications
// POST /notifications: ส่งการแจ้งเตือน
app.post("/notifications", (req, res) => {
    const { user_id, message, is_read } = req.body;
    const created_at = new Date().toISOString();

    if (!user_id || !message || typeof is_read === 'undefined') {
        return res.status(400).send({ message: "Missing required fields" });
    }

    db.run(
        `INSERT INTO notifications (user_id, message, is_read, created_at) 
        VALUES (?, ?, ?, ?)`,
        [user_id, message, is_read, created_at],
        function (err) {
            if (err) return res.status(500).send({ message: "Error sending notification" });
            res.status(201).send({ message: "Notification sent successfully", notification_id: this.lastID });
        }
    );
});

// GET /notifications/:user_id: ดึงการแจ้งเตือนสำหรับผู้ใช้
app.get("/notifications/:user_id", (req, res) => {
    const { user_id } = req.params;

    db.all(`SELECT * FROM notifications WHERE user_id = ?`, [user_id], (err, rows) => {
        if (err) return res.status(500).send({ message: "Error fetching notifications" });
        res.send({ notifications: rows });
    });
});

//Barrier Control
// POST /barrier-control: ควบคุมการพับที่กั้น
app.post("/barrier-control", (req, res) => {
    const { user_id, slot_id, action } = req.body;
    const action_time = new Date().toISOString();

    if (!user_id || !slot_id || !action) {
        return res.status(400).send({ message: "Missing required fields" });
    }

    db.run(
        `INSERT INTO barrier_control (user_id, slot_id, action, action_time) 
        VALUES (?, ?, ?, ?)`,
        [user_id, slot_id, action, action_time],
        function (err) {
            if (err) return res.status(500).send({ message: "Error controlling barrier" });
            res.status(201).send({ message: "Barrier control action recorded", control_id: this.lastID });
        }
    );
});

// GET /barrier-control: ดึงข้อมูลการควบคุมที่กั้นทั้งหมด
app.get("/barrier-control", (req, res) => {
    db.all("SELECT * FROM barrier_control", (err, rows) => {
        if (err) return res.status(500).send({ message: "Error fetching barrier control actions" });
        res.send({ barrier_control: rows });
    });
});

//Extensions
// POST /extensions: การขอต่อเวลา
app.post("/extensions", (req, res) => {
    const { reservation_id, new_end_time, additional_fee } = req.body;

    if (!reservation_id || !new_end_time || !additional_fee) {
        return res.status(400).send({ message: "Missing required fields" });
    }

    db.run(
        `INSERT INTO extensions (reservation_id, new_end_time, additional_fee) 
        VALUES (?, ?, ?)`,
        [reservation_id, new_end_time, additional_fee],
        function (err) {
            if (err) return res.status(500).send({ message: "Error processing extension" });
            res.status(201).send({ message: "Extension request created", extension_id: this.lastID });
        }
    );
});

// GET /extensions/:reservation_id: ดึงข้อมูลการต่อเวลาจาก ID การจอง
app.get("/extensions/:reservation_id", (req, res) => {
    const { reservation_id } = req.params;

    db.get(`SELECT * FROM extensions WHERE reservation_id = ?`, [reservation_id], (err, row) => {
        if (err) return res.status(500).send({ message: "Error fetching extension" });
        if (!row) return res.status(404).send({ message: "Extension not found" });
        res.send({ extension: row });
    });
});

app.listen(5000,() => console.log("Server running on port 5000"));