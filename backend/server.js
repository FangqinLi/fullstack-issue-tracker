import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let issues = [
    {
    id: 1,
    title: "Login page validation bug",
    description: "Email validation does not trigger correctly.",
    status: "open",
    priority: "high",
    assignee: "Alice",
    createdAt: "2026-06-01"
    },
    {
    id: 2,
    title: "Broken image on dashboard",
    description: "Hero banner image fails to load intermittently.",
    status: "in progress",
    priority: "medium",
    assignee: "Bob",
    createdAt: "2026-06-02"
    },
    {
    id: 3,
    title: "Search results not updating",
    description: "Search input occasionally shows stale data.",
    status: "open",
    priority: "high",
    assignee: "Charlie",
    createdAt: "2026-06-02"
    },
    {
    id: 4,
    title: "Pagination UI alignment",
    description: "Pagination buttons shift on smaller screens.",
    status: "closed",
    priority: "low",
    assignee: "David",
    createdAt: "2026-06-03"
    },
    {
    id: 5,
    title: "Dark mode support",
    description: "Add dark theme option for users.",
    status: "open",
    priority: "medium",
    assignee: "Emma",
    createdAt: "2026-06-03"
    },
    {
    id: 6,
    title: "API timeout handling",
    description: "Improve frontend error handling for API failures.",
    status: "in progress",
    priority: "high",
    assignee: "Frank",
    createdAt: "2026-06-04"
    },
    {
    id: 7,
    title: "Table sorting enhancement",
    description: "Allow sorting by priority and status.",
    status: "closed",
    priority: "medium",
    assignee: "Grace",
    createdAt: "2026-06-04"
    },
    {
    id: 8,
    title: "Mobile layout issue",
    description: "Issue table overflows on mobile devices.",
    status: "open",
    priority: "high",
    assignee: "Henry",
    createdAt: "2026-06-05"
    },
    {
    id: 9,
    title: "Duplicate issue creation",
    description: "Users can accidentally create duplicate issues.",
    status: "in progress",
    priority: "medium",
    assignee: "Ivy",
    createdAt: "2026-06-05"
    },
    {
    id: 10,
    title: "Notification banner styling",
    description: "Update banner colors to match design system.",
    status: "closed",
    priority: "low",
    assignee: "Jack",
    createdAt: "2026-06-06"
    }
];

app.get("/api/issues", (req, res) => {
    let result = [...issues];

    const {
        status,
        priority,
        search,
        sortBy = "createdAt",
        order = "desc",
        page = "1",
        limit = "5",
    } = req.query;

    //1. filter by status
    if (status) {
        result = result.filter((issue) => issue.status === status);
    }

    //2. filter by priority
    if(priority){
        result = result.filter((issue) => issue.priority === priority);
    }

    if(search){
        const keyword = search.toLowerCase();

        result = result.filter(
            (issue) => 
                issue.title.toLowerCase().includes(keyword) ||
                issue.description.toLowerCase().includes(keyword)
        );
    }

    result.sort((a, b) => {
        let valueA = a[sortBy];
        let valueB = b[sortBy];

        if(sortBy === "createdAt"){
            valueA = new Date(valueA);
            valueB = new Date(valueB);
        }

        if(sortBy === "priority"){
            const priorityRank = {
                low: 1,
                medium: 2,
                high: 3,
            };

            valueA = priorityRank[valueA];
            valueB = priorityRank[valueB];
        }

        if(valueA < valueB) return order === "asc" ? -1 : 1;
        if(valueA > valueB) return order === "asc" ? 1 : -1;
        return 0;
    });

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const total = result.length;
    const startIndex = (pageNumber - 1) * limitNumber;
    const endIndex = startIndex + limitNumber;

    const paginatedData = result.slice(startIndex, endIndex);

    res.json({
        data: paginatedData,
        page: pageNumber,
        limit: limitNumber,
        total,
    });
});

app.post("/api/issues", (req, res) => {
    const {title, description, priority, assignee} = req.body;

    const newIssue = {
        id: Date.now(),
        title,
        description,
        priority,
        assignee,
        status: "open",
        createdAt: new Date().toISOString(),
    };

    issues.push(newIssue);

    res.status(201).json(newIssue);
});

app.patch("/api/issues/:id", (req, res) => {
    const id = Number(req.params.id);
    const { status, priority, assignee} = req.body;

    const issue = issues.find((item) => item.id === id);

    if(!issue) {
        return res.status(404).json({message: "Issue not found"});
    }

    if(status !== undefined) issue.status = status;
    if(priority !== undefined) issue.priority = priority;
    if(assignee !== undefined) issue.assignee = assignee;

    res.json(issue);
});

app.delete("/api/issues/:id", (req, res) => {
    const id = Number(req.params.id);

    issues = issues.filter((issue) => issue.id !== id);

    res.json({
        message: "Issue deleted successfully",
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});