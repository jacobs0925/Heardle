import json
import base64
import requests
import boto3

dynamodb = boto3.resource('dynamodb')
table_name = 'SECRET'
table = dynamodb.Table(table_name)


def getTracksFromPlaylist(token, offset=0, limit=50):
    playlist_id = "2YRe7HRKNRvXdJBp9nXFza"
    track_endpoint = f'https://api.spotify.com/v1/playlists/{playlist_id}/tracks?limit={limit}&offset={offset}'
    headers = {
        'Authorization': f'Bearer {token}'
    }
    response = requests.get(track_endpoint, headers=headers)
    
    if response.status_code == 200:
        track_data = response.json()
        for item in track_data["items"]:
            if (item != None and item['track'] != None):
                artist_name = None
                artists = item["track"]["artists"]
                if artists:
                    artist_name = artists[0]["name"]
                song_name = item["track"]["name"]
                song_id = item["track"]["id"]
                preview_url = item["track"]["preview_url"]
                
                if (preview_url != None):
                    data = {"artistName": artist_name.lower(), "songName" : song_name.lower(), "previewLink" : preview_url, "songID" : song_id, "hasBeenUsed" : False}
        
                    #print(data)
                    try:
                        table.put_item(Item=data)
                    except Exception as e:
                        print('Error:', e)
                
        next_offset = offset + limit
        total_tracks = track_data.get("total", 0)
        if next_offset < total_tracks:
            print('next offset:', next_offset)
            getTracksFromPlaylist(token, offset=next_offset, limit=limit)

    
def lambda_handler(event, context):


    client_id = 'SECRET'
    client_secret = 'SECRET'
    
    base64_encoded = base64.b64encode(f"{client_id}:{client_secret}".encode('utf-8')).decode('utf-8')
    
    # Set up authentication options
    auth_options = {
        'url': 'https://accounts.spotify.com/api/token',
        'headers': {
            'Authorization': f'Basic {base64_encoded}'
        },
        'data': {
            'grant_type': 'client_credentials'
        }
    }
    
    # Make a POST request to obtain the access token
    response = requests.post(**auth_options)
    
    if response.status_code == 200:
        # Parse the response JSON
        body = response.json()
        token = body.get('access_token')

    
    return getTracksFromPlaylist(token)
