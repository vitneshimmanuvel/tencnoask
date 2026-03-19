import { MISRecord, Task } from "./types";

export const MOCK_MIS_RECORDS: MISRecord[] = [
  {
    id: "1",
    clientName: "Amazon",
    department: "Customer Support",
    customerId: "CUST10521",
    issueType: "Delivery Delay",
    responseStatus: "Pending",
    assignedEmployee: "Parameswari V",
    remarks: "Awaiting Response",
    lastUpdated: "08 Mar 2026 10:45 AM",
  },
  {
    id: "2",
    clientName: "Flipkart",
    department: "Sales MIS",
    customerId: "CUST10522",
    issueType: "Refund Pending",
    responseStatus: "Completed",
    assignedEmployee: "R Karthik",
    remarks: "Processed",
    lastUpdated: "08 Mar 2026 11:15 AM",
  },
  {
    id: "3",
    clientName: "Zomato",
    department: "Operations MIS",
    customerId: "CUST10523",
    issueType: "Payment Failed",
    responseStatus: "In Progress",
    assignedEmployee: "Divya S",
    remarks: "Verification in progress",
    lastUpdated: "08 Mar 2026 11:30 AM",
  },
  {
    id: "4",
    clientName: "Swiggy",
    department: "Client Data MIS",
    customerId: "CUST10524",
    issueType: "Account Blocked",
    responseStatus: "Pending",
    assignedEmployee: "Naveen Kumar",
    remarks: "User verification required",
    lastUpdated: "08 Mar 2026 11:45 AM",
  },
  {
    id: "5",
    clientName: "Myntra",
    department: "Customer Support",
    customerId: "CUST10525",
    issueType: "Wrong Item",
    responseStatus: "Completed",
    assignedEmployee: "Parameswari V",
    remarks: "Replacement initiated",
    lastUpdated: "08 Mar 2026 12:00 PM",
  },
  {
    id: "6",
    clientName: "Amazon",
    department: "Operations MIS",
    customerId: "CUST10526",
    issueType: "Address Change",
    responseStatus: "In Progress",
    assignedEmployee: "R Karthik",
    remarks: "Updating database",
    lastUpdated: "08 Mar 2026 12:15 PM",
  },
  {
    id: "7",
    clientName: "Flipkart",
    department: "Client Data MIS",
    customerId: "CUST10527",
    issueType: "Order Cancellation",
    responseStatus: "Pending",
    assignedEmployee: "Divya S",
    remarks: "Pending approval",
    lastUpdated: "08 Mar 2026 12:30 PM",
  },
  {
    id: "8",
    clientName: "Meesho",
    department: "Sales MIS",
    customerId: "CUST10528",
    issueType: "Catalog Error",
    responseStatus: "In Progress",
    assignedEmployee: "Parameswari V",
    remarks: "Fixing image links",
    lastUpdated: "08 Mar 2026 12:45 PM",
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: "MIS-T103",
    client: "Flipkart",
    department: "Sales MIS",
    type: "Data Validation",
    status: "In Progress",
    assigned_to: "MIS1001",
    records_required: 50,
    records_completed: 35,
    created_at: "2026-03-08T09:00:00Z",
  },
  {
    id: "MIS-T104",
    client: "Amazon",
    department: "Customer Support MIS",
    type: "Complaint Entry",
    status: "Pending",
    assigned_to: "MIS1001",
    records_required: 100,
    records_completed: 0,
    created_at: "2026-03-08T10:30:00Z",
  },
  {
    id: "MIS-T105",
    client: "Meesho",
    department: "Sales MIS",
    type: "Catalog Audit",
    status: "In Progress",
    assigned_to: "MIS1001",
    records_required: 75,
    records_completed: 42,
    created_at: "2026-03-08T11:00:00Z",
  },
];

export const COMPANY_LIFE_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1626245912441-2679f9f22941?q=80&w=1200&auto=format&fit=crop",
    caption: "Mysore Palace: Weekend Team Outing",
    date: "07 Mar 2026",
    category: "Outing"
  },
  {
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop",
    caption: "Technotask Mysore: Main Operations Floor",
    date: "08 Mar 2026",
    category: "Office"
  },
  {
    url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1200&auto=format&fit=crop",
    caption: "Strategy Meeting: Amazon MIS Project",
    date: "06 Mar 2026",
    category: "Meeting"
  },
  {
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop",
    caption: "Team Collaboration: Data Validation Hub",
    date: "05 Mar 2026",
    category: "Work"
  },
  {
    url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop",
    caption: "Monthly Training Workshop: Advanced Excel",
    date: "04 Mar 2026",
    category: "Training"
  },
];

export const DEPARTMENTS = [
  "Customer Support MIS",
  "Sales MIS",
  "Operations MIS",
  "Client Data MIS",
];
