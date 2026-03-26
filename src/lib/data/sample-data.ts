import { v4 as uuidv4 } from "uuid";

export const customers = [
  { id: "C001", name: "Alice Johnson", email: "alice@example.com", city: "New York", country: "USA", totalOrders: 47, totalSpent: 12450.50, segment: "Premium", joinDate: "2022-03-15" },
  { id: "C002", name: "Bob Smith", email: "bob@example.com", city: "London", country: "UK", totalOrders: 23, totalSpent: 5670.00, segment: "Standard", joinDate: "2023-01-10" },
  { id: "C003", name: "Carlos Rodriguez", email: "carlos@example.com", city: "Madrid", country: "Spain", totalOrders: 89, totalSpent: 34200.75, segment: "VIP", joinDate: "2021-06-22" },
  { id: "C004", name: "Diana Chen", email: "diana@example.com", city: "Shanghai", country: "China", totalOrders: 12, totalSpent: 2890.00, segment: "Standard", joinDate: "2024-02-01" },
  { id: "C005", name: "Erik Johansson", email: "erik@example.com", city: "Stockholm", country: "Sweden", totalOrders: 56, totalSpent: 18900.25, segment: "Premium", joinDate: "2022-09-05" },
  { id: "C006", name: "Fatima Al-Hassan", email: "fatima@example.com", city: "Dubai", country: "UAE", totalOrders: 34, totalSpent: 9800.00, segment: "Premium", joinDate: "2023-04-18" },
  { id: "C007", name: "George Okafor", email: "george@example.com", city: "Lagos", country: "Nigeria", totalOrders: 78, totalSpent: 28500.50, segment: "VIP", joinDate: "2021-11-30" },
  { id: "C008", name: "Hannah Kim", email: "hannah@example.com", city: "Seoul", country: "South Korea", totalOrders: 5, totalSpent: 1250.00, segment: "Standard", joinDate: "2024-05-12" },
  { id: "C009", name: "Ivan Petrov", email: "ivan@example.com", city: "Moscow", country: "Russia", totalOrders: 41, totalSpent: 15600.75, segment: "Premium", joinDate: "2022-07-20" },
  { id: "C010", name: "Julia Santos", email: "julia@example.com", city: "São Paulo", country: "Brazil", totalOrders: 67, totalSpent: 22100.00, segment: "VIP", joinDate: "2021-08-14" },
  { id: "C011", name: "Kenji Tanaka", email: "kenji@example.com", city: "Tokyo", country: "Japan", totalOrders: 29, totalSpent: 8700.50, segment: "Standard", joinDate: "2023-06-01" },
  { id: "C012", name: "Lisa Mueller", email: "lisa@example.com", city: "Berlin", country: "Germany", totalOrders: 52, totalSpent: 17800.25, segment: "Premium", joinDate: "2022-02-28" },
  { id: "C013", name: "Marco Rossi", email: "marco@example.com", city: "Milan", country: "Italy", totalOrders: 18, totalSpent: 4500.00, segment: "Standard", joinDate: "2024-01-15" },
  { id: "C014", name: "Nina Patel", email: "nina@example.com", city: "Mumbai", country: "India", totalOrders: 93, totalSpent: 38900.75, segment: "VIP", joinDate: "2021-04-10" },
  { id: "C015", name: "Oscar Hernandez", email: "oscar@example.com", city: "Mexico City", country: "Mexico", totalOrders: 37, totalSpent: 11200.50, segment: "Premium", joinDate: "2022-10-05" },
  { id: "C016", name: "Priya Sharma", email: "priya@example.com", city: "Delhi", country: "India", totalOrders: 61, totalSpent: 20400.00, segment: "VIP", joinDate: "2021-12-20" },
  { id: "C017", name: "Quinn O'Brien", email: "quinn@example.com", city: "Dublin", country: "Ireland", totalOrders: 14, totalSpent: 3800.25, segment: "Standard", joinDate: "2024-03-08" },
  { id: "C018", name: "Ravi Krishnan", email: "ravi@example.com", city: "Bangalore", country: "India", totalOrders: 45, totalSpent: 14300.50, segment: "Premium", joinDate: "2022-05-17" },
  { id: "C019", name: "Sofia Andersson", email: "sofia@example.com", city: "Oslo", country: "Norway", totalOrders: 72, totalSpent: 25600.75, segment: "VIP", joinDate: "2021-09-03" },
  { id: "C020", name: "Thomas Weber", email: "thomas@example.com", city: "Vienna", country: "Austria", totalOrders: 26, totalSpent: 7200.00, segment: "Standard", joinDate: "2023-08-22" },
];

export const products = [
  { id: "P001", name: "Laptop Pro 15", category: "Electronics", price: 1299.99, stock: 150, supplier: "TechCorp", weight: 2.1 },
  { id: "P002", name: "Wireless Headphones", category: "Electronics", price: 199.99, stock: 500, supplier: "AudioMax", weight: 0.3 },
  { id: "P003", name: "Ergonomic Chair", category: "Furniture", price: 449.99, stock: 75, supplier: "ComfortPlus", weight: 15.5 },
  { id: "P004", name: "Standing Desk", category: "Furniture", price: 699.99, stock: 40, supplier: "ComfortPlus", weight: 28.0 },
  { id: "P005", name: "Smart Watch", category: "Electronics", price: 349.99, stock: 300, supplier: "TechCorp", weight: 0.1 },
  { id: "P006", name: "Coffee Machine", category: "Appliances", price: 249.99, stock: 200, supplier: "BrewMaster", weight: 5.2 },
  { id: "P007", name: "Mechanical Keyboard", category: "Electronics", price: 149.99, stock: 450, supplier: "KeyCraft", weight: 0.9 },
  { id: "P008", name: "Monitor 27\"", category: "Electronics", price: 399.99, stock: 120, supplier: "TechCorp", weight: 6.8 },
  { id: "P009", name: "Desk Lamp", category: "Furniture", price: 79.99, stock: 600, supplier: "LightWorks", weight: 1.2 },
  { id: "P010", name: "USB-C Hub", category: "Electronics", price: 59.99, stock: 800, supplier: "TechCorp", weight: 0.2 },
  { id: "P011", name: "Webcam HD", category: "Electronics", price: 89.99, stock: 350, supplier: "TechCorp", weight: 0.15 },
  { id: "P012", name: "Mouse Pad XL", category: "Accessories", price: 29.99, stock: 1000, supplier: "DeskPro", weight: 0.4 },
  { id: "P013", name: "Cable Organizer", category: "Accessories", price: 19.99, stock: 2000, supplier: "DeskPro", weight: 0.1 },
  { id: "P014", name: "Bluetooth Speaker", category: "Electronics", price: 129.99, stock: 250, supplier: "AudioMax", weight: 0.8 },
  { id: "P015", name: "Whiteboard", category: "Office", price: 149.99, stock: 90, supplier: "OfficeMax", weight: 8.5 },
  { id: "P016", name: "Printer", category: "Electronics", price: 299.99, stock: 60, supplier: "TechCorp", weight: 12.0 },
  { id: "P017", name: "Notebook Set", category: "Office", price: 24.99, stock: 1500, supplier: "PaperCo", weight: 0.5 },
  { id: "P018", name: "External SSD 1TB", category: "Electronics", price: 109.99, stock: 400, supplier: "TechCorp", weight: 0.1 },
  { id: "P019", name: "Desk Fan", category: "Appliances", price: 49.99, stock: 300, supplier: "CoolAir", weight: 1.5 },
  { id: "P020", name: "Power Strip", category: "Electronics", price: 34.99, stock: 700, supplier: "TechCorp", weight: 0.6 },
];

export const orders = Array.from({ length: 50 }, (_, i) => {
  const customer = customers[Math.floor(Math.random() * customers.length)];
  const product = products[Math.floor(Math.random() * products.length)];
  const quantity = Math.floor(Math.random() * 5) + 1;
  const status = ["pending", "processing", "shipped", "delivered", "cancelled"][Math.floor(Math.random() * 5)];
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return {
    id: `ORD-${String(i + 1).padStart(5, "0")}`,
    customerId: customer.id,
    customerName: customer.name,
    productId: product.id,
    productName: product.name,
    quantity,
    unitPrice: product.price,
    totalPrice: +(product.price * quantity).toFixed(2),
    status,
    orderDate: `2024-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    region: customer.country,
    paymentMethod: ["Credit Card", "PayPal", "Bank Transfer", "Crypto"][Math.floor(Math.random() * 4)],
  };
});

export const employees = [
  { id: "E001", name: "Sarah Mitchell", department: "Engineering", role: "Senior Developer", salary: 125000, hireDate: "2020-03-15", manager: "E010", performance: 4.8 },
  { id: "E002", name: "James Wilson", department: "Engineering", role: "Developer", salary: 95000, hireDate: "2022-01-10", manager: "E001", performance: 4.2 },
  { id: "E003", name: "Emily Davis", department: "Marketing", role: "Marketing Manager", salary: 110000, hireDate: "2021-06-22", manager: "E010", performance: 4.5 },
  { id: "E004", name: "Michael Brown", department: "Sales", role: "Sales Rep", salary: 75000, hireDate: "2023-02-01", manager: "E008", performance: 3.9 },
  { id: "E005", name: "Jennifer Taylor", department: "Engineering", role: "DevOps Engineer", salary: 115000, hireDate: "2021-09-05", manager: "E001", performance: 4.6 },
  { id: "E006", name: "David Lee", department: "Finance", role: "Financial Analyst", salary: 85000, hireDate: "2022-04-18", manager: "E009", performance: 4.1 },
  { id: "E007", name: "Amanda White", department: "HR", role: "HR Specialist", salary: 70000, hireDate: "2023-05-12", manager: "E010", performance: 4.0 },
  { id: "E008", name: "Robert Garcia", department: "Sales", role: "Sales Manager", salary: 120000, hireDate: "2020-07-20", manager: "E010", performance: 4.7 },
  { id: "E009", name: "Lisa Anderson", department: "Finance", role: "Finance Director", salary: 140000, hireDate: "2019-08-14", manager: "E010", performance: 4.9 },
  { id: "E010", name: "William Martinez", department: "Executive", role: "CEO", salary: 250000, hireDate: "2018-01-01", manager: null, performance: 5.0 },
  { id: "E011", name: "Karen Thompson", department: "Engineering", role: "QA Engineer", salary: 90000, hireDate: "2022-06-01", manager: "E001", performance: 4.3 },
  { id: "E012", name: "Christopher Moore", department: "Engineering", role: "Junior Developer", salary: 70000, hireDate: "2024-02-28", manager: "E002", performance: 3.8 },
  { id: "E013", name: "Jessica Clark", department: "Marketing", role: "Content Writer", salary: 65000, hireDate: "2023-01-15", manager: "E003", performance: 4.0 },
  { id: "E014", name: "Daniel Robinson", department: "Sales", role: "Sales Rep", salary: 75000, hireDate: "2023-08-22", manager: "E008", performance: 4.4 },
  { id: "E015", name: "Michelle Walker", department: "Engineering", role: "Data Engineer", salary: 110000, hireDate: "2021-11-30", manager: "E001", performance: 4.7 },
];

export const transactions = Array.from({ length: 100 }, (_, i) => {
  const customer = customers[Math.floor(Math.random() * customers.length)];
  const type = ["purchase", "refund", "subscription", "adjustment"][Math.floor(Math.random() * 4)];
  const amount = +(Math.random() * 500 + 10).toFixed(2);
  return {
    id: `TXN-${String(i + 1).padStart(6, "0")}`,
    customerId: customer.id,
    type,
    amount: type === "refund" ? -amount : amount,
    currency: "USD",
    timestamp: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}T${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:00Z`,
    status: Math.random() > 0.1 ? "completed" : "pending",
    reference: uuidv4().slice(0, 8).toUpperCase(),
  };
});

export const inventory = products.map((p) => ({
  productId: p.id,
  productName: p.name,
  warehouse: ["WH-East", "WH-West", "WH-Central", "WH-Intl"][Math.floor(Math.random() * 4)],
  quantity: p.stock,
  reorderLevel: Math.floor(p.stock * 0.2),
  lastRestocked: `2024-${String(Math.floor(Math.random() * 6) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
  unitCost: +(p.price * 0.6).toFixed(2),
}));
