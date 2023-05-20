import React, { useState } from "react";
import styled from "styled-components";
import { keyframes } from 'styled-components'

import StringForm from "./InputForms/StringForm";

const animate = keyframes`
    from {
        left: -200px;
        opacity: 0;
    }
    to {
        left: 0px;
        opacity: 1;
    }
`

const FormContainer = styled.div`
    position: relative;
    left: 0px;
    animation-name: ${animate};
    animation-duration: 0.3s;
`

const FormInput = styled.input`
    border: none;
    border-bottom: 2px solid black;
    outline: none;
`

const InputSection = () => {
    const [question, setQuestion] = useState(0);

    const questions = [
        {
            "question": "Where will you be going?",
            "inputType": "text"
        },
        {
            "question": "When will you be staying there?",
            "inputType": "date"
        },
        {
            "question": "When will you be leaving?",
            "inputType": "date"
        },
        {
            "question": "What is your budget for this trip?",
            "inputType": "number"
        },
    ]

    const [answers, setAnswer] = useState([]);

    const formContainer = document.getElementById("formContainer");

    function grabResponse (question, change) {
        answers.push(
            {
                "question": questions[question]["question"],
                "answer": document.getElementById("inputBox").value
            }
        ); 
        document.getElementById("inputBox").value = "";
        setAnswer(answers)
        if (change === "prev" && (question - 1) > 0) {
            setQuestion(question - 1)
        }
        else if (change === "next" && (question + 1) < questions.length) {
            setQuestion(question + 1)
        }

        // Submit
        if ((question + 1) === questions.length) {
            console.log(answers)
            fetch(`https://0e2a-209-52-88-186.ngrok-free.app/itenary/activities?location=${answers[0]["answer"]}&startDate=${answers[1]["answer"]}&endDate=${answers[2]["answer"]}&budget=${answers[3]["answer"]}`, {
                method: 'GET',
                mode: 'cors'
            })
            .then(res => {
                res = res.json();
            })
            .then(jsonData => {
                console.log(jsonData)
            })
            .catch(err => {
                console.log(err)
            })
        }
    }

    return (
        // Form container
        <FormContainer id="formContainer">

            <label>{questions[question]["question"]}</label>
            <br></br>
            <FormInput id="inputBox" type={questions[question]["inputType"]} alt={question}></FormInput>

            <button onClick={() => grabResponse(question, "prev")}>Prev</button>
            <button onClick={() => grabResponse(question, "next")}>Next</button>
        </FormContainer>
    )
}

export default InputSection;