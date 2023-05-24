const express = require("express");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const app = express();
const employeeDataFile = "employees.json";

// Middleware to parse JSON data
app.use(express.json());

// Function to read employee data from JSON file
function readEmployeeData() {
  try {
    const data = fs.readFileSync(employeeDataFile, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Function to write employee data to JSON file
function writeEmployeeData(employees) {
  const data = JSON.stringify(employees, null, 2);
  fs.writeFileSync(employeeDataFile, data);
}

// Function to validate employee data
function validateEmployeeData(employee) {
  if (
    !employee.salutation ||
    !employee.firstName ||
    !employee.lastName ||
    !employee.email ||
    !employee.phone ||
    !employee.dob ||
    !employee.gender ||
    !employee.qualifications ||
    !employee.address ||
    !employee.city ||
    !employee.state ||
    !employee.country ||
    !employee.username ||
    !employee.password
  ) {
    return false;
  }

  if (!validateEmail(employee.email)) {
    return false;
  }

  if (!validatePhone(employee.phone)) {
    return false;
  }

  if (!validateDate(employee.dob)) {
    return false;
  }

  return true;
}

// Function to validate email format
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to validate phone number format
function validatePhone(phone) {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
}

// Function to validate date format (DD-MM-YYYY)
function validateDate(date) {
  const dateRegex = /^(0[1-9]|[1-2][0-9]|3[0-1])-(0[1-9]|1[0-2])-\d{4}$/;
  return dateRegex.test(date);
}

// Get all employees
app.get("/employees", (req, res) => {
  const employees = readEmployeeData();
  res.json(employees);
});

// Get an employee by ID
app.get("/employees/:id", (req, res) => {
  const employees = readEmployeeData();
  const employee = employees.find((emp) => emp.id === req.params.id);

  if (!employee) {
    res.status(404).json({ error: "Employee not found" });
  } else {
    res.json(employee);
  }
});

// Create an employee
app.post("/employees", (req, res) => {
  const employees = readEmployeeData();
  const newEmployee = req.body;

  if (!validateEmployeeData(newEmployee)) {
    res.status(400).json({ error: "Invalid employee data" });
  } else {
    newEmployee.id = uuidv4();
    employees.push(newEmployee);
    writeEmployeeData(employees);
    res
      .status(201)
      .json({ message: "Employee created successfully", id: newEmployee.id });
  }
});

// Update an employee
app.put("/employees/:id", (req, res) => {
  const employees = readEmployeeData();
  const employeeIndex = employees.findIndex((emp) => emp.id === req.params.id);

  if (employeeIndex === -1) {
    res.status(404).json({ error: "Employee not found" });
  } else {
    const updatedEmployee = req.body;

    if (!validateEmployeeData(updatedEmployee)) {
      res.status(400).json({ error: "Invalid employee data" });
    } else {
      employees[employeeIndex] = {
        ...employees[employeeIndex],
        ...updatedEmployee,
      };
      writeEmployeeData(employees);
      res.json({ message: "Employee updated successfully" });
    }
  }
});

// Delete an employee
app.delete("/employees/:id", (req, res) => {
  const employees = readEmployeeData();
  const employeeIndex = employees.findIndex((emp) => emp.id === req.params.id);

  if (employeeIndex === -1) {
    res.status(404).json({ error: "Employee not found" });
  } else {
    employees.splice(employeeIndex, 1);
    writeEmployeeData(employees);
    res.json({ message: "Employee deleted successfully" });
  }
});

// Start the server
app.listen(3000, () => {
  console.log("API server is running on port 3000");
});
