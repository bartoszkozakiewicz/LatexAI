from typing import Union
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from vertexai.language_models import TextGenerationModel

import arxiv
import subprocess
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

@app.post("/api/bibliography")
async def read_item(info: Request):
        data = await info.json()
        search = arxiv.Search(query = "dcgan", max_results = 3)
        citations = []
        for result in search.results():
            index = result.pdf_url.index('pdf/')
            doi = result.pdf_url[index + 4:]
            summary = result.summary
            citation = subprocess.run(['arxiv2bib', doi], stdout=subprocess.PIPE)
            citation = citation.stdout.decode('utf-8')
            citations.append(citation)
        print('='*80)
        print(result.title, doi)
        print('---')
        print(citation)

        return {citation}




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
    prompt1 = f"""
    You will be given just one page of a scientific paper with text only, you won't be able to see the figures.
    The paper includes some syntax from LaTeX, disregard this syntax and focus only on the text content of the page.

    Set of rules you must follow:
    Do not summarize the page or make a recommendation for acceptance or rejection. This is not your job.
    Do not build on the content with your personal knowledge, you should only review the content of the page.
    Do not include criteria that are not relevant to the page given to you.
    Review only the page given to you, do not point things out that are not on the page as they may be addressed in other pages.
    Try to give some constructive feedback, don't just say "this is bad" or "this is good".
    Each step should be separated by four hashtags, i.e. {delimiter}.
    Remember to use the right format and give some details.
    Make sure to include {delimiter} AFTER the step number to separate every step.

    Remember to follow the set of rules.

    Follow these steps to conduct a review of a page from a scientific paper, for every step check those aspects carefully, line by line:

    Step 1: Check if the page has a coherent structure and logical arrangement of content.
    Step 2: Return list of errors in given text. They are misspellings. Return all of them, it is mandatory. Write it in given format information about the line and the column and misspelled word.
    Step 3: Check if the author have correctly cited and referred to relevant sources. If you see any error in given line. Show information about it and add suggestions how to solve this error
    Step 4: Check if the paper is written in a formal, objective, and precise language. Point out if there are any colloquialisms, slang expressions, and informal phrases, show exactly where error occurred.
    Step 5: Organize your review comments from previous steps into a numbered list. Which should be easy to read by human.

    Use the following format:
    {delimiter} Step 1: <step 1 reasoning>
    {delimiter} Step 2: <step 2 reasoning>
    {delimiter} Step 3: <step 3 reasoning>
    {delimiter} Step 4: <step 4 reasoning>
    {delimiter} Step 5: <step 5 reasoning>

  
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
    final_response = re.sub('^\s*Step \d:\s+', '', final_response)

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
        As an author preparing a paper for publication on ScienceDirect, I am writing the entire manuscript using LaTeX.
        I want to make sure that I use LaTeX rules and include appropriate syntax in my document.
        I put XXX mark which I want you to exchange with suggested continuation. Take under consideration words before this mark as well as after it, based on their context find the most appropriate substitute. You must use words before and after XXX mark only as an context. You cannot copy it. You should create something on your own. It is necessary.
        Find the best possible set of words which could be used instead of XXX mark.

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



# Take note of any errors, gaps, or inconsistencies in the article, both in terms of substantive content and technical aspects. If you see any error in given line. Show information about it and add suggestions how to solve this error. Also look for misspelling, they might occur often. Pay extra attention to them. You must list all of the error. It is mandatory! 

#


#   Step 3: Check if the author have correctly cited and referred to relevant sources. If you see any error in given line. Show information about it and add suggestions how to solve this error
#     Step 4: Check if the paper is written in a formal, objective, and precise language. Point out if there are any colloquialisms, slang expressions, and informal phrases, show exactly where error occurred.
#     Step 5: Organize your review comments from previous steps into a numbered list. Which should be easy to read by human.

#     Use the following format:
#     {delimiter} Step 1: <step 1 reasoning>
#     {delimiter} Step 2: <step 2 reasoning>
#     {delimiter} Step 3: <step 3 reasoning>
#     {delimiter} Step 4: <step 4 reasoning>
#     {delimiter} Step 5: <step 5 reasoning>