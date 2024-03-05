import json
import boto3
from boto3.dynamodb.conditions import Key, Attr


region = 'us-west-1'
dynamodb = boto3.resource('dynamodb', region_name=region)
table_name = 'SECRET'
table = dynamodb.Table(table_name)
RESULT_LIMIT = 8

def getFirstN(search_query, N):
    filter_expression = Attr('songName').contains(search_query.lower()) | Attr('artistName').contains(search_query.lower())

    response = table.scan(
        FilterExpression=filter_expression
    )
    
    items = response.get('Items', [])
    return items[:N]
    
def lambda_handler(event, context):
    query = event['queryStringParameters']['q']
    return getFirstN(query, RESULT_LIMIT)
