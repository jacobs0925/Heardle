import json
import base64
import requests
import boto3
import random

dynamodb = boto3.resource('dynamodb')
table_name = 'SECRET'
table = dynamodb.Table(table_name)

s3_bucket = 'heardle'
s3_key = 'song.json'



def get_random_unused_item():
    response = table.scan(
        FilterExpression='hasBeenUsed = :value',
        ExpressionAttributeValues={':value': False}
    )

    items = response.get('Items', [])

    if not items:
        print('No unused items found.')
        return None

    random_item = random.choice(items)
    return random_item
    
def writeDataToS3(data):
        s3 = boto3.client('s3')
        s3.put_object(
            Bucket=s3_bucket,
            Key=s3_key,
            Body=json.dumps(data),
            ContentType='application/json'
        )

    
def lambda_handler(event, context):
    random_unused_item = get_random_unused_item()
    writeDataToS3(random_unused_item)
    item_id = random_unused_item.get('songName')
    artist_name = random_unused_item.get('artistName')
    table.update_item(
    Key={'songName': item_id,
        'artistName': artist_name
    },
        UpdateExpression='SET hasBeenUsed = :val',
        ExpressionAttributeValues={':val': True}
    )
    return random_unused_item
    
    