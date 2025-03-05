import boto3
import os
import json
import random

sqs = boto3.client("sqs",region_name=os.getenv("AWS_REGION"),aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"))

queue_url = "https://sqs.eu-north-1.amazonaws.com/730335250189/testQueue.fifo" 

def send_message(num1, num2, message_group_id="default"):
    message_body = json.dumps({"num1": num1, "num2": num2})

    response = sqs.send_message(
        QueueUrl=queue_url,
        MessageBody=message_body,
        MessageGroupId=message_group_id 
    )
    print(f"Message sent with ID: {response['MessageId']}")

for i in range(7): 
    num1 = random.randint(1, 100)  
    num2 = random.randint(1, 100) 
    send_message(num1, num2)
