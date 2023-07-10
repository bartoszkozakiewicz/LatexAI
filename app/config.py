
from google.cloud import aiplatform
import vertexai
from vertexai.language_models import TextGenerationModel
from collections import Counter
import pandas as pd 
from nltk.tokenize import word_tokenize
import re

aiplatform.init(
    # your Google Cloud Project ID or number
    # environment default used is not set
    project='lively-ace-392206',

    # the Vertex AI region you will use
    # defaults to us-central1
    # location='us-central1',

    # Google Cloud Storage bucket in same region as location
    # used to stage artifacts
    # staging_bucket='gs://my_staging_bucket',

    # custom google.auth.credentials.Credentials
    # environment default creds used if not set
    # credentials=my_credentials,

    # customer managed encryption key resource name
    # will be applied to all Vertex AI resources if set
    # encryption_spec_key_name=my_encryption_key_name,

    # the name of the experiment to use to track
    # logged metrics and parameters
    experiment='my-experiment',

    # description of the experiment above
    experiment_description='my experiment decsription'
)

vertexai.init(project="lively-ace-392206", location="us-central1")

def delete_latex_from_string(string):
    string = '\n'.join([re.sub('^\s+', '', s) for s in string.split('\n')])
    string = '\n'.join([s for s in string.split('\n') if not s.startswith('\\') and not s.startswith('%')])
    return string

with open('example_article.txt', 'r') as f:
        word_freq = f.read().lower()
        word_freq = delete_latex_from_string(word_freq).split()
        word_freq = Counter(word_freq)
examples_df = pd.Series(dict(word_freq)).rename('example_freq').to_frame()
examples_df['example_freq'] = examples_df['example_freq'] / examples_df['example_freq'].sum()

