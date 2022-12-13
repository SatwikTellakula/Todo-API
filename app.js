const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
let db = null;
const dbPath = path.join(__dirname, "todoApplication.db");
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertToDoDbObjectToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
    category: dbObject.category,
    dueDate: dbObject.due_date,
  };
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const hasSearchProperty = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};
const hasCategoryAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};
const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};
const hasCategoryAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status, category } = request.query;
  switch (true) {
    case hasStatusProperty(request.query):
      getTodosQuery = `
            select * from todo where todo LIKE '%${search_q}%'
            AND status='${status}' ;
            `;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
            select * from todo where todo LIKE '%${search_q}%' 
            AND priority='${priority}';
            `;
      break;
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
            SELECT
            *
            FROM
            todo 
            WHERE
            todo LIKE '%${search_q}%'
            AND status = '${status}'
            AND priority = '${priority}';`;
      break;
    case hasSearchProperty(request.query):
      getTodosQuery = `
         SELECT
            *
            FROM
            todo 
            WHERE
            todo LIKE '%${search_q}%';
        `;
      break;
    case hasCategoryAndStatusProperties(request.query):
      getTodosQuery = `
        SELECT * FROM todo WHERE todo LIKE '%${search_q}%'
        AND category ='${category}'
        AND status = '${status}';
        `;
      break;
    case hasCategoryProperty(request.query):
      getTodosQuery = `
        SELECT * FROM todo WHERE todo LIKE '%${search_q}%'
        AND category ='${category}';
        `;
      break;
    case hasCategoryAndPriorityProperties(request.query):
      getTodosQuery = `
        SELECT * FROM todo WHERE todo LIKE '%${search_q}%'
        AND category ='${category}'
        AND priority = '${priority}';
        `;
      break;
  }
  data = await db.all(getTodosQuery);
  response.send(
    data.map((eachToDo) => convertToDoDbObjectToResponseObject(eachToDo))
  );
});

module.exports = app;
