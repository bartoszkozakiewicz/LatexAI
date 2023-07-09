from typing import Union
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from vertexai.language_models import TextGenerationModel

# to start app cd to project root directory and run:
# uvicorn app.main:app --reload
# reference: https://fastapi.tiangolo.com/#run-it

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

data_generator = None
# count = 0


@app.post("/api/review")
async def read_item(info: Request):
    data = await info.json()
    data = data['latexText']
    print('review started')
    print(data)
    # raise

    parameters = {
        "temperature": 0.2,
        "max_output_tokens": 800,
        "top_p": 0.8,
        "top_k": 40
    }
    model = TextGenerationModel.from_pretrained("text-bison@001")

    delimiter = "####"
    prompt1 = f"""
    You will be given just one page of a scientific paper with text only, you won't be able to see the figures.

    Set of rules you must follow:
    Do not summarize the page or make a recommendation for acceptance or rejection. This is not your job.
    Do not build on the content with your personal knowledge, you should only review the content of the page.
    Do not include criteria that are not relevant to the page given to you.
    Review only the page given to you, do not point things out that are not on the page as they may be addressed in other pages.

    Remember to follow the set of rules.
    Each query will be delimited with four hashtags, i.e. {delimiter}.

    Follow these steps to conduct a review of a page from a scientific paper:
    Step 1:{delimiter} Check if the page has a coherent structure and logical arrangement of content.
    Step 2:{delimiter} Verify if the introduction, results, discussion, and conclusions are appropriately presented.
    Step 3:{delimiter} Take note of any errors, gaps, or inconsistencies in the article, both in terms of substantive content and technical aspects.
    Step 4:{delimiter} Verify if the conclusions align with the gathered data.
    Step 5:{delimiter} Check if the author have correctly cited and referred to relevant sources.
    Step 6:{delimiter} Check if the paper is written in a formal, objective, and precise language. The use of colloquialisms, slang expressions, and informal phrases is prohibited.
    Step 7:{delimiter} Prepare a formal review of the page.

    Use the following format (2 sentences for each step):
    Step 1:
    {delimiter} <step 1 reasoning>
    Step 2:
    {delimiter} <step 2 reasoning>
    Step 3:
    {delimiter} <step 3 reasoning>
    Step 4:
    {delimiter} <step 4 reasoning>
    Step 5:
    {delimiter} <step 5 reasoning>
    Step 6:
    {delimiter} <step 6 reasoning>
    Step 7:
    {delimiter} <step 7 reasoning>

    Remember to use the right format and give some details.
    Make sure to include {delimiter} to separate every step.
    Remember that you are reviewing only one page of the paper.
    Use the delimiters.
    """

    responses = list()
    messages = prompt1 + '\ninput: ' + data + '\noutput: '
    completion = model.predict(messages, **parameters)

    print(f"Response from Model:\n {completion.text}")

    try:
        final_response = completion.text.split(delimiter)[-1].strip()
    except Exception as e:
        final_response = "Sorry, I'm having trouble right now, please try asking another question."

    print('\n\n', final_response)

    return {'final_response': final_response}


@app.post("/api/compile")
async def read_item(info: Request):
    data = await info.json()
    print('xd')
    print(data)
    return {}


@app.post("/api/autocomplete")
async def read_item(info: Request):
    data = await info.json()
    data = data['latexText']
    print('autocomplete started')
    print(data)

    parameters = {
        "temperature": 0.4,
        "max_output_tokens": 40,
        "top_p": 0.8,
        "top_k": 40
    }
    model = TextGenerationModel.from_pretrained("text-bison@001")
    response = model.predict(

        """
        As an author preparing a paper for publication on ScienceDirect, I am writing the entire manuscript using LaTeX.
        I want to ensure that I adhere to all LaTeX rules and include appropriate syntax in my document.
        Please provide the LaTeX syntax to end the following sentence:

        input: {}
        output:
        """.format(data),

        **parameters
    )
    print(f"Response from Model: {response.text}")

    return {'final_response': response.text}


# @app.post("/pdf")
# async def read_item(info: Request):
#     data = await info.json()
#     return {"source": "../data/pdf/sample_string.pdf"}
