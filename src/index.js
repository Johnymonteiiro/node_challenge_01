const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, NEXT) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found!" });
  }
  request.user = user;
  return NEXT();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const userExist = users.find((user) => user.username === username);

  if (userExist) {
    return response.status(400).json({ error: "User alredy exist" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(201).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const toDoList = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(toDoList);

  return response.status(201).json(toDoList);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const toDo = user.todos.find((todo) => todo.id === id);
  if (!toDo) {
    return response.status(404).json({ error: "Todo do not found!" });
  }

  toDo.title = title;
  toDo.deadline = deadline;
  user.todos.push(toDo);

  return response.status(201).json(toDo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const toDo = user.todos.find((todo) => todo.id === id);
  if (!toDo) {
    return response.status(404).json({ error: "Tod do not found!" });
  }
  toDo.done = true;

  return response.status(201).json(toDo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const toDo = user.todos.findIndex((todo) => todo.id === id);
  if (toDo === -1) {
    return response.status(404).json({ error: "To do not found" });
  }
  user.todos.splice(toDo, 1);
  return response.status(204).send();
});

module.exports = app;
