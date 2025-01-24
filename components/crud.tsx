import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("university.db");

// Faculty CRUD Operations
export async function addFaculty(name: string, description: string) {
    const result = await db.runAsync(
        'INSERT INTO faculties (name, description) VALUES ($name, $description)',
        { $name: name, $description: description }
    );
    return { id: result.lastInsertRowId, changes: result.changes };
}

export async function getFaculties() {
    const result = await db.getAllAsync('SELECT * FROM faculties');
    return result;
}

export async function getFacultyById(id: number) {
    const result = await db.getFirstAsync(
        'SELECT * FROM faculties WHERE id = $id',
        { $id: id }
    );
    return result;
}

export async function updateFaculty(id: number, name: string, description: string) {
    const result = await db.runAsync(
        'UPDATE faculties SET name = $name, description = $description WHERE id = $id',
        { $id: id, $name: name, $description: description }
    );
    return { changes: result.changes };
}

export async function deleteFaculty(id: number) {
    const result = await db.runAsync(
        'DELETE FROM faculties WHERE id = $id',
        { $id: id }
    );
    return { changes: result.changes };
}

// Promotion CRUD Operations
export async function addPromotion(
    name: string, 
    facultyId: number, 
    academicYear: string
) {
    const result = await db.runAsync(
        'INSERT INTO promotions (name, faculty_id, academic_year) VALUES ($name, $facultyId, $academicYear)',
        { 
            $name: name, 
            $facultyId: facultyId, 
            $academicYear: academicYear 
        }
    );
    return { id: result.lastInsertRowId, changes: result.changes };
}

export async function getPromotions() {
    const result = await db.getAllAsync(`
        SELECT p.*, f.name as faculty_name 
        FROM promotions p
        JOIN faculties f ON p.faculty_id = f.id
    `);
    return result;
}

export async function getPromotionById(id: number) {
    const result = await db.getFirstAsync(
        `SELECT p.*, f.name as faculty_name 
         FROM promotions p
         JOIN faculties f ON p.faculty_id = f.id
         WHERE p.id = $id`,
        { $id: id }
    );
    return result;
}

export async function getPromotionsByFaculty(facultyId: number) {
    const result = await db.getAllAsync(
        `SELECT p.*, f.name as faculty_name 
         FROM promotions p
         JOIN faculties f ON p.faculty_id = f.id
         WHERE p.faculty_id = $facultyId`,
        { $facultyId: facultyId }
    );
    return result;
}

export async function updatePromotion(
    id: number, 
    name: string, 
    facultyId: number, 
    academicYear: string
) {
    const result = await db.runAsync(
        'UPDATE promotions SET name = $name, faculty_id = $facultyId, academic_year = $academicYear WHERE id = $id',
        { 
            $id: id, 
            $name: name, 
            $facultyId: facultyId, 
            $academicYear: academicYear 
        }
    );
    return { changes: result.changes };
}

export async function deletePromotion(id: number) {
    const result = await db.runAsync(
        'DELETE FROM promotions WHERE id = $id',
        { $id: id }
    );
    return { changes: result.changes };
}

// Student CRUD Operations
export async function addStudent(
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    promotionId: number,
    registrationNumber: string
) {
    const result = await db.runAsync(
        `INSERT INTO students (
            first_name, 
            last_name, 
            email, 
            phone, 
            promotion_id, 
            registration_number
        ) VALUES (
            $firstName, 
            $lastName, 
            $email, 
            $phone, 
            $promotionId, 
            $registrationNumber
        )`,
        {
            $firstName: firstName,
            $lastName: lastName,
            $email: email,
            $phone: phone,
            $promotionId: promotionId,
            $registrationNumber: registrationNumber
        }
    );
    return { id: result.lastInsertRowId, changes: result.changes };
}

export async function getStudents() {
    const result = await db.getAllAsync(`
        SELECT 
            s.*,
            p.name as promotion_name,
            f.name as faculty_name
        FROM students s
        JOIN promotions p ON s.promotion_id = p.id
        JOIN faculties f ON p.faculty_id = f.id
    `);
    return result;
}

export async function getStudentById(id: number) {
    const result = await db.getFirstAsync(
        `SELECT 
            s.*,
            p.name as promotion_name,
            f.name as faculty_name
         FROM students s
         JOIN promotions p ON s.promotion_id = p.id
         JOIN faculties f ON p.faculty_id = f.id
         WHERE s.id = $id`,
        { $id: id }
    );
    return result;
}

export async function getStudentsByPromotion(promotionId: number) {
    const result = await db.getAllAsync(
        `SELECT 
            s.*,
            p.name as promotion_name,
            f.name as faculty_name
         FROM students s
         JOIN promotions p ON s.promotion_id = p.id
         JOIN faculties f ON p.faculty_id = f.id
         WHERE s.promotion_id = $promotionId`,
        { $promotionId: promotionId }
    );
    return result;
}

export async function updateStudent(
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    promotionId: number,
    registrationNumber: string
) {
    const result = await db.runAsync(
        `UPDATE students SET 
            first_name = $firstName,
            last_name = $lastName,
            email = $email,
            phone = $phone,
            promotion_id = $promotionId,
            registration_number = $registrationNumber
         WHERE id = $id`,
        {
            $id: id,
            $firstName: firstName,
            $lastName: lastName,
            $email: email,
            $phone: phone,
            $promotionId: promotionId,
            $registrationNumber: registrationNumber
        }
    );
    return { changes: result.changes };
}

export async function deleteStudent(id: number) {
    const result = await db.runAsync(
        'DELETE FROM students WHERE id = $id',
        { $id: id }
    );
    return { changes: result.changes };
}

// Error Handler
export function withErrorHandling(fn: Function) {
    return async (...args: any[]) => {
        try {
            return await fn(...args);
        } catch (error) {
            console.error('Database operation failed:', error);
            throw error;
        }
    };
}
