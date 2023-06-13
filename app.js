require("dotenv").config();

const express = require("express");
const app = express();

app.use(express.json());

const port = process.env.APP_PORT ?? 5001;

const movieHandlers = require("./movieHandlers");
const userHandlers = require("./userHandlers");
const { hashPassword, verifyPassword, verifyToken } = require("./auth.js");

//ROUTES PUBLIQUES:
app.get("/api/movies", movieHandlers.getMovies);
app.get("/api/movies/:id", movieHandlers.getMovieById);

app.get("/api/users", userHandlers.getUsers);
app.get("/api/users/:id", userHandlers.getUserById);
//route register
app.post("/api/users", hashPassword, userHandlers.postUser);
//route login
app.post(
  "/api/login",
  userHandlers.getUserByEmailWithPasswordAndPassToNext,
  verifyPassword,
  (req, res) => {
    // Génération du token
    const payload = { sub: req.user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Renvoi du token en réponse
    res.json({ token });
  }
);

//il faut utiliser une route post sur PostMan avec le contenu :
/* {
  "email": "rightuser@test.com",
  "password": "123456"
} 
afin de réaliser une authentification correcte et obtenir le token valide 1h */

//ROUTES PROTEGEES par authentification:

app.use(verifyToken);
//toutes les routes sous app.use(verifyToken) sont incluses dans le mur d'authenficiation
//et utilisent le middleware verifyToken.
//il est donc nécessaire de se connecter en tant qu'utilisateur pour obtenir le token
//avant de pouvoir faire une requête via ces routes
//sur POSTMAN : dans "HEADER", ajouter "Authorization" > "Bearer LeTokenObtenuApresConnexionUtilisateur"

app.post("/api/movies", movieHandlers.postMovie);
app.put("/api/movies/:id", movieHandlers.updateMovie);
app.delete("/api/movies/:id", movieHandlers.deleteMovie);

app.put("/api/users/:id", hashPassword, userHandlers.updateUser);
app.delete("/api/users/:id", userHandlers.deleteUser);

app.listen(port, (err) => {
  if (err) {
    console.error("Something bad happened");
  } else {
    console.log(`Server is listening on ${port}`);
  }
});
