

CREATE TABLE Symptoms (
    symptom_id SERIAL PRIMARY KEY,
    symptom_name VARCHAR(100) NOT NULL,
    confidence_level DECIMAL(3, 2) CHECK (confidence_level BETWEEN 0 AND 1)
);

CREATE TABLE Solutions (
    solution_id SERIAL PRIMARY KEY,
    solution_description TEXT NOT NULL
);


CREATE TABLE Rules (
    rule_id SERIAL PRIMARY KEY,
    symptom_id INT REFERENCES Symptoms(symptom_id) ON DELETE CASCADE,
    solution_id INT REFERENCES Solutions(solution_id) ON DELETE CASCADE,
    ALTER TABLE Rules ADD COLUMN conditions TEXT;


);
-- here the farmer would be able to make inputs about his farm conditons. 
CREATE TABLE FarmConditions (
    condition_id SERIAL PRIMARY KEY,
    condition_name VARCHAR(100) NOT NULL UNIQUE,
    confidence_deduction DECIMAL(3, 2) CHECK (confidence_deduction BETWEEN -1 AND 0) -- Ensures valid deduction range
);
-- this to relate the rules to the farm condtions
CREATE TABLE RuleFarmConditions (
    rule_id INT REFERENCES Rules(rule_id) ON DELETE CASCADE,
    condition_id INT REFERENCES FarmConditions(condition_id) ON DELETE CASCADE,
    PRIMARY KEY (rule_id, condition_id)
);

-- Took this data from your rules. that's why i included the FarmConditons table above
INSERT INTO FarmConditions (condition_name, confidence_deduction) VALUES
('Low Temperature', -0.2),
('Acidic pH', -0.2),
('Low Rainfall', -0.2),
('Sandy Soil', -0.2),
('Poor Pest Control', -0.3),
('Poor Fertility', -0.3),
('Poor Irrigation', -0.3);


INSERT INTO Symptoms (symptom_name, confidence_level) VALUES
('Yellowish-whitish streaks', 0.9),
('Discoloration', 0.8),
('Stunted growth', 0.7),
('Small pale circular spots', 0.7),
('Leaf curling', 0.6),
('Reduced cob formation', 0.5),
('Decreased root development', 0.5);


INSERT INTO Solutions (solution_description) VALUES
('Strongly suspect maize streak disease'),
('Weak suspicion, request additional input'),
('Insufficient evidence, rule out disease');


INSERT INTO Rules (symptom_id, solution_id, conditions) VALUES
(1, 1, 'IF yellowish-whitish streaks AND discoloration THEN suspect maize streak disease'),
(3, 1, 'IF stunted growth AND small pale circular spots THEN suspect maize streak disease'),
(5, 1, 'IF chlorosis AND leaf curling THEN suspect maize streak disease'),
(6, 1, 'IF reduced cob formation AND decreased root development THEN suspect maize streak disease'),
(1, 1, 'IF all symptoms present THEN confirm maize streak disease'),
(1, 2, 'IF single symptom with confidence ≥ 0.8 THEN strongly suspect'),
(1, 3, 'IF single symptom with confidence < 0.8 THEN rule out disease');



-- note i added this below because i thought it could be help make the system perform more realistically
-- , you can remove them if u think otherwise

CREATE TABLE FarmReports (
    report_id SERIAL PRIMARY KEY,
    description TEXT, 
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE FarmReportSymptoms (
    report_id INT REFERENCES FarmReports(report_id) ON DELETE CASCADE,
    symptom_id INT REFERENCES Symptoms(symptom_id) ON DELETE CASCADE,
    PRIMARY KEY (report_id, symptom_id)
);