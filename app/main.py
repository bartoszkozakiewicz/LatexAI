from typing import Union
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from vertexai.language_models import TextGenerationModel

import arxiv
import subprocess
import re
from collections import Counter
import pandas as pd 
from nltk.tokenize import word_tokenize
from app.config import *

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


@app.post("/api/bibliography")
async def read_item(info: Request):
        data = await info.json()
        data = data['latexText']
        data = delete_latex_from_string(data)
        # data = data.replace('\n', '.')
        data = data.split('.')[-1]
        # data should be short (1-2 sentences)
        print('='*50, data, '='*50)
        search = arxiv.Search(query=data, max_results=3)
        citations = []

        doi = None
        citation = None
        summary = None
        title = None
        for result in search.results():
            index = result.pdf_url.index('pdf/')
            doi = result.pdf_url[index + 4:]
            title = result.title
            summary = result.summary
            citation = subprocess.run(['arxiv2bib', doi], stdout=subprocess.PIPE)
            citation = citation.stdout.decode('utf-8')
            citations.append(citation)
            break


        return {'doi': doi, 'citation': citation, 'summary': summary, 'title': title}
      
      
@app.post("/api/review")
async def read_item(info: Request):
    data = await info.json()
    data = data['latexText']
    data = delete_latex_from_string(data)
    print('review started')
    print(data)
    # raise

    parameters = {
        "temperature": 0.0,
        "max_output_tokens": 800,
        "top_p": 0.8,
        "top_k": 1
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

    prompt1 = f"""You will be given a single page of a scientific paper with text only, you won\'t be able to see the figures.
        The objective of this review is to provide constructive feedback and evaluate the quality of the paper.
        Focus on the text content and disregard any LaTeX syntax or figures.
        Ensure that each comment includes a specific example from the text to support and illustrate the feedback.
        Follow the provided format for each step.

        You must write some constructive feedback about the page. Follow these steps to conduct a review of a page from a scientific paper, for every step check those aspects carefully, line by line:
        Step 1: Check if the page has good style, if it reads well is clear and concise without much repetition.
        Step 2: Check if the page has a coherent structure and logical arrangement of content.
        Step 3: Check if the paper is written in a formal, objective, and precise language.

        Use the following format:
        Step 1: <step 1 reasoning>
        Step 2: <step 2 reasoning>
        Step 3: <step 3 reasoning>

        input: Once upon a time, there was a bunny. He was happy and run in the forest. Suddenly, he see a big carrot and wunt eat. Banny jamp, but too high and fall down. Ouch! Bunny hurt his leg. He cry and can\'t walk. Bunny feel sad and alone. Then, a kind squirrel come. Squirrel say, \"I help you, bunny!\" and take bunny to a cozy nest. Bunny feel better and say, \"Thank you, squirrel!\" Bunny and squirrel become best friends. They play and laugh in the forest every day. Bunny never forget the big carrot, but he know he have friend who care. The end.
        output: Step 1: The page doesn't read well, it seems as if a child wrote it. 
        Step 2: The page lacks a coherent structure and logical arrangement of content. The text appears to be a children\'s story rather than a scientific paper. There is no clear introduction, methods, results, or conclusion sections that are typically found in scientific papers.
        Step 3: The paper is not written in a formal, objective, and precise language. It uses informal language, storytelling style, and includes dialogue between characters, which is not appropriate for a scientific paper. Scientific papers require a more formal tone and focus on presenting research findings and analysis.
        Constructive Feedback: The content provided does not resemble a scientific paper, but rather a children\'s story. It lacks the necessary structure, formal language, and objective tone expected in scientific writing. The text needs to be revised to adhere to the conventions of scientific writing and present research findings in a clear and organized manner.
    """

    # responses = list()
    
    # print(f"Response from Model:\n {completion.text}")

    # try:
    #     final_response = completion.text.split(delimiter)[-1].strip()
    # except Exception as e:
    #     final_response = "Sorry, I'm having trouble right now, please try asking another question."

    # print('\n\n', final_response)
    # final_response = re.sub('^\s*Step \d:\s+', '', final_response)

    t = word_tokenize(data.lower())
    cnt = Counter(t)

    
    relevant_df = pd.Series(dict(cnt)).rename('relevant_freq').to_frame()
    relevant_df['relevant_freq'] = relevant_df['relevant_freq'] / relevant_df['relevant_freq'].sum()

    m = examples_df['example_freq'].min()
    l = len(relevant_df)
    relevant_df = relevant_df.join(examples_df, how='left').fillna(m)
    assert len(relevant_df) == l

    relevant_df['ratio'] = (relevant_df['example_freq'] - relevant_df['relevant_freq']).abs() / relevant_df['example_freq']
    relevant_df.sort_values(by='ratio', ascending=False)

    banned_words = {'figure', '\\ref', 'fig', 'dfg'}
    relevant_df = relevant_df.loc[relevant_df.index.str.len() > 1]
    relevant_df = relevant_df.loc[~relevant_df.index.isin(banned_words)]

    abused_words = relevant_df.index[:3]
    abused_words = ['"' + word + '"' for word in abused_words]
    abused_words = "\nStep 1: Following words: " + ", ".join(abused_words[:-1]) + ' and ' + abused_words[-1] + \
        ' are used too frequently. Think about using synonyms.\n'
    
    messages = prompt1 + '\ninput: ' + data + '\noutput: ' + abused_words
    completion = model.predict(messages, **parameters)

    # final_response = '\n'.join(completion.text.split(delimiter))
    final_response = abused_words + completion.text
    final_response = final_response.split('Step')
    final_response = [re.sub('^\s+|\s+$', '', s) for s in final_response]
    final_response = [s for s in final_response if s != '']

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
        "temperature": 0.0,
        "max_output_tokens": 10,
        "top_p": 0.8,
        "top_k": 1
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