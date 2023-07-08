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

@app.post("/api/compile")
async def read_item(info: Request):
    data = await info.json()
    print('xd')
    print(data)

    parameters = {
        "temperature": 0.2,
        "max_output_tokens": 200,
        "top_p": 0.8,
        "top_k": 40
    }
    model = TextGenerationModel.from_pretrained("text-bison@001")
    response = model.predict(
        """Make a LaTeX table with 3 columns and 10 rows. Fill the cells with placeholders: [X]""",
        **parameters
    )
    print(f"Response from Model: {response.text}")
    # global data_generator
    # global count
    # count = 0
    # stories = get_n_stories(3)
    # data_generator = StoryGenerator(data['settings']['pages'], data['settings']['summary'], stories)
    return {}

# @app.post("/settings")
# async def read_item(info: Request):
#     data = await info.json()
#     global data_generator
#     global count
#     count = 0
#     stories = get_n_stories(3)
#     data_generator = StoryGenerator(data['settings']['pages'], data['settings']['summary'], stories)
#     return {}


# @app.post("/page")
# async def read_item(info: Request):
#     data = await info.json()  # Data from post
#     print(data)
#     global data_generator
#     count = data['page']

#     if count == 0:
#         summary = data_generator.generate_story_description()
#         print('Summary:', summary)
#         text = data_generator.generate_story_beginning()
#         print('Beginning:', text)
#     elif count < data_generator.n_pages - 1:
#         if count == 1:
#             data_generator.beginning = data['text']
#         else:
#             data_generator.continuations[-1] = data['text']
#         text = data_generator.generate_story_continuation()
#         print('Continuation:', text)
#     else:
#         data_generator.continuations[-1] = data['text']
#         text = data_generator.generate_story_ending()
#         print('Ending:', text)

#     # count += 1

#     return {"text": text}  # Use this format


# @app.post("/image")
# async def read_item(info: Request):
#     data = await info.json()
#     part = data['text']

#     img = None
#     max_tokens = 40
#     while img is None:
#         summarized_part = StorySummarizer(part, max_tokens=max_tokens).summarize()
#         max_tokens = int(max_tokens * 0.75)
#         img = get_image_to_story_segment(summarized_part)

#     return {"image": img}


# @app.post("/pdf")
# async def read_item(info: Request):
#     data = await info.json()
#     return {"source": "../data/pdf/sample_string.pdf"}
