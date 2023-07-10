# LatexAI

**<p align="center">ABOUT</p>**

LatexAI is powered by Google's PaLM and is focusing on helping the writing process of technical and scientific articles. During ideation we have identified 3 core functionalities that could help our users boost both effectiveness and efficiency of their work. Those functionalities are:
1. Live autocompletion working both for natural language (text) and LaTeX syntax.
2. Suggestions for citations and assistance in creating a bibliography. (With a usage of arxiv search)
3. Conducting a comprehensive review of the paper.
We believe that by providing and improving those 3 functionalities we can provide a lot of value to our users.

Further planned features are:
1. Interactive chat which will return latex syntax asked by user, for example: Table with space for user to fill with text.
2. Spelling, grammar, and punctuation checking and correction for the text. Potentially with a usage of Grammarly API.
3. ...

**<p align="center" style="font-size: 35px;" >INTERFACE</p>**

**Overall look**

![image](https://github.com/bartoszkozakiewicz/LatexAI/assets/105235140/292cdddd-7e51-4b23-bafe-cafa24e75a44)

<br/><br/>

**1. Autocomplete function**

<div align="center">
  <img src="https://github.com/bartoszkozakiewicz/LatexAI/assets/105235140/665ff657-e8b4-4e98-be16-36d61ca36b5f" alt="Image" />
  <br/>
  <img src="https://github.com/bartoszkozakiewicz/LatexAI/assets/105235140/99950256-d4bc-4ce8-986f-da6aea04143f" />
</div>

<br/><br/>

**2. Bibliography function**

<div align="center">
  <img src="https://github.com/bartoszkozakiewicz/LatexAI/assets/105235140/8ee7a56a-cd81-4bcc-b5ef-b53a2e7c87c1"/>
</div>
<br/><br/>

**3. Review function** (Example with properly written article)

<p align="center">
  <img src="https://github.com/bartoszkozakiewicz/LatexAI/assets/105235140/4d8632c1-ffab-4860-ac79-7ea0c9c8515d" alt="Image" />
</p>

<br/><br/>

**<p align="center">INSTALLATION PROCESS</p>**
**1. Installing dependencies for server:** <br/><br/>
Install dependencies from requirements.txt
```
pip install -r requirements.txt
```
For configuring server, please follow instructions here: https://cloud.google.com/docs/authentication/provide-credentials-adc

**2. Installing dependencies for client:** <br/><br/>
Install NodeJs: https://nodejs.org/en/download/package-manager <br/><br/>
Run below:
```
npm i react-scripts
```

**<p align="center">RUNNING APP</p>**
**1. Start server:** <br/><br/>
From root of the GH project run command:
```
uvicorn app.main:app
```

**2. Start client:** <br/><br/>
From root/client run command:
```
npm start
```
