import express, { Request, json, urlencoded} from "express";
import { env } from "process";
import { Client } from "pg";
import { randomUUID } from "crypto";
import morgan from "morgan";

const port = parseInt(env.PORT ?? "8080");
const host = env.HOST ?? "localhost";

const client = new Client({
    database: env.DB_NAME ?? "express_note",
    host: env.DB_HOST ?? "localhost",
    user: env.DB_USER ?? "express_note",
    port: parseInt(env.DB_PORT ?? "5432"),
    password: env.DB_PASSWORD ?? "secret"
});

const app = express();

app.use(morgan("dev"))
app.use(urlencoded({extended: true}))

app.post("/notes", async (req: Request<{}, {},{title: string, author: string, content: string}>, res) => {
    await client.query({
        text: "INSERT INTO notes(id, title, author, content) VALUES ($1, $2, $3, $4)",
        values: [randomUUID(), req.body.title, req.body.author, req.body.content]
    })
    res.status(200).send();
})

app.get("/notes", async (req: Request<{}, {}, {author: string}>, res) => {
    const result = await client.query({
        text: "SELECT id, title, author, content FROM notes WHERE author=$1",
        values: [req.body.author],
        rowMode: "array"
    })
    res.status(200).send({code: 200, status: "OK", data: result.rows});
})

app.listen(port, host, async () => {
    await client.connect();
    console.log(`Application listening on http://${host}:${port}`);
});
