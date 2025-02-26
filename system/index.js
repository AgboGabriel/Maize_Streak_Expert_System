import express from "express"
import path from "path";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import env from "dotenv";

const app = express();
const port = process.env.Port||3000
env.config();
// const db= new pg.Client({
//     user:"postgres",
//     host:"localhost",
//     password:"@chim0t@",
//     database:"Expert_System",
//     port: 5000,
//   })
//   db.connect();

const { Pool } = pg;
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 5432, // PostgreSQL default port
    ssl: {
      rejectUnauthorized: false,  // Allow self-signed SSL certificates
    }
  });
  pool.connect()
  
app.use(bodyParser.urlencoded({extended:true}));

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static("public"));


// Route for displaying the form
app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.post('/solution', async (req, res) => {
    const { symptom_name, confidence_level, condition_name, confidence_level_for_farm_conditions } = req.body;

    console.log("Received Data:");
    console.log("Symptom:", symptom_name);
    console.log("Confidence Level:", confidence_level);
    console.log("Condition Name:", condition_name);
    console.log("Confidence Level for Farm Conditions:", confidence_level_for_farm_conditions);

    try {
        // Step 1: Retrieve matching symptom and its confidence level from the database
        const symptomResult = await pool.query(
            "SELECT symptom_id, symptom_name, confidence_level FROM Symptoms WHERE LOWER(symptom_name) LIKE '%' || $1 || '%';",
            [symptom_name.toLowerCase()]
        );

        if (symptomResult.rows.length === 0) {
            // Symptom not found, display custom message in solutionText
            let solutionText = `The symptom '${symptom_name}' is not a symptom of maize streak disease. 
                                Your crop might be affected by a different disease. 
                               Please check other symptoms for better diagnosis..`;
            return res.render('solution.ejs', { solutionText });
        }

        const foundSymptom = symptomResult.rows[0]; // Assuming only one match
        console.log("Matching Symptom Found:", foundSymptom);

        // Step 2: Compare confidence levels
        if (confidence_level >= foundSymptom.confidence_level) {
            console.log("User's confidence level is sufficient to provide a solution.");

            // Step 3: Retrieve solution based on symptom_id and confidence_level
            const solutionResult = await db.query(
                "SELECT solution_description FROM Solutions WHERE solution_id IN (SELECT solution_id FROM Rules WHERE symptom_id = $1);",
                [foundSymptom.symptom_id]
            );

            if (solutionResult.rows.length > 0) {
                const solution = solutionResult.rows[0].solution_description;
                console.log("Solution Found:", solution);

                // Step 4: Render the solution
                let solutionText = `We recommend: '${solution}' for symptom '${symptom_name}' with confidence level '${confidence_level}' 
                                    based on farm conditions '${condition_name}' with intensity '${confidence_level_for_farm_conditions}'.`;

                return res.render('solution.ejs', { solutionText });
            } else {
                let solutionText = `No specific solution found for symptom '${symptom_name}' with confidence level '${confidence_level}'. 
                                    Further investigation is recommended.`;
                return res.render('solution.ejs', { solutionText });
            }
        } else {
            let solutionText = `The confidence level for symptom '${symptom_name}' is too low for an accurate diagnosis. 
                                Further observation and testing are needed.`;
            return res.render('solution.ejs', { solutionText });
        }
    } catch (err) {
        console.error("Error encountered:", err);
        let solutionText = "An error occurred while retrieving the solution. Please try again later.";
        return res.render('solution.ejs', { solutionText });
    }
});

// Start the server
app.listen(port, () => {
    console.log('Server is running on http://localhost:3000');
});
