import json
import pandas as pd
from scipy.sparse import csr_matrix
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

# Opens JSON file as a Python object
def open_json(json_path):
  with open(json_path, 'r', encoding='utf-8') as json_file:
    return json.load(json_file)
  
ratings = open_json('beer.json')
users = open_json('users.json')

beer_id_to_name = {}
user_id_to_name = {}

for user in users:
  user_id_to_name[user['user_id']] = user['user_name']

for rating in ratings:
  user_id = rating['user_id']
  beer_id = rating['beer_id']
  beer_id_to_name[beer_id] = rating['beer_name']

beer_ids = list(beer_id_to_name.keys())

# Convert to pandas data frame
df = pd.read_json('beer.json')

# Convert user ids and beer ids to categorical types to ensure compactness
df['user_id'] = df['user_id'].astype("category")
df['beer_id'] = df['beer_id'].astype("category")

# Get codes/indices for user ids and beer ids
row_indices = df['user_id'].cat.codes
col_indices = df['beer_id'].cat.codes

# Get scores for the values in the cells of the matrix
data = df['score'].values

# Create a sparse matrix (to save on memory, since most of the matrix would be empty)
sparse_user_item_matrix = csr_matrix((data, (row_indices, col_indices)), shape=(df['user_id'].nunique(), df['beer_id'].nunique()))

# Compute cosine similarity matrix for all beers (in sparse format)
def cosine_similarity_sparse(X):
  # Magnitudes of beer rows
  X_norms = np.sqrt(X.power(2).sum(axis=1))

  # Normalize X
  # Add a small value (1e-10) to avoid division by zero
  X_normalized = X.multiply(1 / (X_norms + 1e-10))

  # Dot product of normalized matrix and rotated normalized matrix is the similarity
  return X_normalized.dot(X_normalized.T)

# Compute for future use
cosine_sim_sparse = cosine_similarity_sparse(sparse_user_item_matrix.T)

# Map beer id to code used in the matrix
def beer_id_to_code(beer_id):
  return df['beer_id'].cat.categories.get_loc(beer_id)

# precompute_similar_beers()
similar_for = open_json('similar_beers.json')

# Returns recommendations from given ratings of a single user
def get_recommendations_from_ratings(ratings, top_n=5):
  # Get rated and unrated beer ids
  rated_beer_ids = [rating['beer_id'] for rating in ratings]
  unrated_beer_ids = [id for id in beer_ids if id not in rated_beer_ids]

  # Mapping of beer id to a score (for faster lookup)
  user_rating_of = {rating['beer_id']: float(rating['score']) for rating in ratings}

  if not unrated_beer_ids:
    print('User has no unrated beers')
    return []

  recommended = []

  # Iterate unrated beers and calculate predicted score
  for i in unrated_beer_ids:
    i_code = beer_id_to_code(i)

    # Get top similar beers from the precomputed matrix
    similar_beer_ids = similar_for[str(i)]

    # Variables for aggrigated sum
    a, b = 0, 0

    # Iterate similar beers and update the aggregates
    for j in similar_beer_ids:
      j_code = beer_id_to_code(j)
      similarity = cosine_sim_sparse[i_code, j_code]

      # Only take into account beers already rated by the user
      if j in user_rating_of:
        j_rating = user_rating_of[j]
        a += similarity * j_rating
        b += similarity

    if a and b:
      pred_rating = a / b
      recommended.append((pred_rating, i))

  # Sort by predicted rating (descending)
  recommended.sort(reverse=True)

  # Take top N and return
  return recommended[:top_n]

#FLASK CODE
  
app = Flask('__name__')
CORS(app)

@app.route('/', methods=['POST'])
def home():
    userRatings = request.json
    print(json.loads(userRatings['ratings']))
    recommendations = get_recommendations_from_ratings(json.loads(userRatings['ratings']))
    return recommendations

if __name__ == "__main__":
    app.run(host="0.0.0.0",port=5000)
    # app.run(debug=True) #can alter host and port number here. Right now the default host is localhost and port is 5000w