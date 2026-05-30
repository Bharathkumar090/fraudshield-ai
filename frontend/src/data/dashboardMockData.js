import {
  Activity,
  AlertTriangle,
  BarChart3,
  Gauge,
} from "lucide-react";

export const dashboardStats = [
  {
    label: "Total Transactions",
    value: "128,420",
    change: "+12.8%",
    helper: "Processed this month",
    icon: Activity,
    tone: "blue",
  },
  {
    label: "Fraud Detected",
    value: "1,284",
    change: "+3.1%",
    helper: "Flagged transactions",
    icon: AlertTriangle,
    tone: "violet",
  },
  {
    label: "High Risk",
    value: "426",
    change: "-4.6%",
    helper: "Needs analyst review",
    icon: BarChart3,
    tone: "rose",
  },
  {
    label: "Average Risk Score",
    value: "0.42",
    change: "+0.03",
    helper: "Across recent scans",
    icon: Gauge,
    tone: "slate",
  },
];

export const fraudMixData = [
  { name: "Legitimate", share: 99, transactions: 124812 },
  { name: "Fraud", share: 1, transactions: 1284 },
];

export const recentHighRiskTransactions = [
  {
    id: "TX-80942",
    merchant: "Northstar Digital",
    amount: "$4,820.00",
    score: "0.94",
    status: "Review",
  },
  {
    id: "TX-80718",
    merchant: "Metro Wallet Transfer",
    amount: "$2,390.75",
    score: "0.89",
    status: "Blocked",
  },
  {
    id: "TX-80477",
    merchant: "Vertex Travel Desk",
    amount: "$6,145.20",
    score: "0.86",
    status: "Review",
  },
  {
    id: "TX-80231",
    merchant: "Apex Cloud Services",
    amount: "$1,980.40",
    score: "0.81",
    status: "Escalated",
  },
];
