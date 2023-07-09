from typing import Union
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from vertexai.language_models import TextGenerationModel
import re

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


def delete_latex_from_string(string):
    string = '\n'.join([re.sub('^\s+', '', s) for s in string.split('\n')])
    string = '\n'.join([s for s in string.split('\n') if not s.startswith('\\')])
    return string


@app.post("/api/review")
async def read_item(info: Request):
    data = await info.json()
    data = data['latexText']
    data = delete_latex_from_string(data)
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
    # prompt1 = f"""
    # You will be given just one page of a scientific paper with text only, you won't be able to see the figures.
    # The paper includes some syntax from LaTeX, disregard this syntax and focus only on the text content of the page.

    # Set of rules you must follow:
    # Do not summarize the page or make a recommendation for acceptance or rejection. This is not your job.
    # Do not build on the content with your personal knowledge, you should only review the content of the page.
    # Do not include criteria that are not relevant to the page given to you.
    # Review only the page given to you, do not point things out that are not on the page as they may be addressed in other pages.
    # Try to give some constructive feedback, don't just say "this is bad" or "this is good".
    # Each step should be separated by four hashtags, i.e. {delimiter}.
    # Remember to use the right format and give some details.
    # Make sure to include {delimiter} AFTER the step number to separate every step.

    # Remember to follow the set of rules.

    # Follow these steps to conduct a review of a page from a scientific paper:
    # Step 1: Check if the page has a coherent structure and logical arrangement of content.
    # Step 2: Take note of any errors, gaps, or inconsistencies in the article, both in terms of substantive content and technical aspects.
    # Step 3: Check if the author have correctly cited and referred to relevant sources.
    # Step 4: Check if the paper is written in a formal, objective, and precise language. Point out if there are any colloquialisms, slang expressions, and informal phrases.
    # Step 5: Organize your review comments from previous steps into a numbered list.

    # Use the following format (2 sentences for each step):
    # {delimiter} Step 1: <step 1 reasoning>
    # {delimiter} Step 2: <step 2 reasoning>
    # {delimiter} Step 3: <step 3 reasoning>
    # {delimiter} Step 4: <step 4 reasoning>
    # {delimiter} Step 5: <step 5 reasoning>
    # """

    prompt1 = f"""
    You will be given just one page of a scientific paper with text only, you won't be able to see the figures.
    The paper includes some syntax from LaTeX, disregard this syntax and focus only on the text content of the page.
    You must write some constructive feedback about the page following the 4 steps specified below.

    Set of rules you must follow:
    Every comment MUST have a specific example from the text that supports it and illustrates it.
    Do not give any comments without supporting examples.
    Make sure to include {delimiter} BEFORE the step number to separate every step.

    Remember to follow the set of rules.

    Follow these steps to conduct a review of a page from a scientific paper, for every step check those aspects carefully, line by line:

    Step 1: Check if the page has a coherent structure and logical arrangement of content.
    Step 2: Return list of errors in given text. They are misspellings. Return all of them, it is mandatory. Write it in given format information about the line and the column and misspelled word.
    Step 3: Check if the author have correctly cited and referred to relevant sources. If you see any error in given line. Show information about it and add suggestions how to solve this error
    Step 4: Check if the paper is written in a formal, objective, and precise language. Point out if there are any colloquialisms, slang expressions, and informal phrases, show exactly where error occurred.

    Use the following format:
    {delimiter} Step 1: <step 1 reasoning>
    {delimiter} Step 2: <step 2 reasoning>
    {delimiter} Step 3: <step 3 reasoning>
    {delimiter} Step 4: <step 4 reasoning>
    """

    responses = list()
    messages = prompt1 + '\ninput: ' + data + '\noutput: '
    completion = model.predict(messages, **parameters)

    final_response = '\n'.join(completion.text.split(delimiter))
    # print(f"Response from Model:\n {completion.text}")

    # try:
    #     final_response = completion.text.split(delimiter)[-1].strip()
    # except Exception as e:
    #     final_response = "Sorry, I'm having trouble right now, please try asking another question."

    # print('\n\n', final_response)
    # final_response = re.sub('^\s*Step \d:\s+', '', final_response)

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
        "temperature": 0.8,
        "max_output_tokens": 10,
        "top_p": 0.8,
        "top_k": 40
    }
    model = TextGenerationModel.from_pretrained("text-bison@001")
    response = model.predict(

        """
        As an author on ScienceDirect, I am writing my entire manuscript in LaTeX, following its rules and syntax.
        Throughout my document, I have marked certain areas with an XXX placeholder,
        and I need your assistance in suggesting the appropriate continuation based on the context.
        \Your task is to find the best fill for the XXX mark, ensuring it aligns seamlessly with the surrounding words
        and may require adding additional letters to complete the word.


        input: """ + data + 'output: ',

        **parameters
    )
    print(f"Response from Model: {response.text}")

    response = response.text
    response = re.sub('^\n+|\n+$', '', response)
    return {'final_response': response}


# @app.post("/pdf")
# async def read_item(info: Request):
#     data = await info.json()
#     return {"source": "../data/pdf/sample_string.pdf"}

#
