import sys
import openai
import requests
import json
import io
import re

# Set your OpenAI API key
openai.api_key = "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"


def complete_code(prompt):
    
    prompt = prompt.split("//")[-1]

    match = re.search(r':\s(.*?)(?=\s-G)', prompt)


    if match:
        extracted_text = match.group(1)
        prompt = extracted_text
    else:
        return 'Not found any story for generate code'

    temperature = 0.7

    max_tokens = 1999

    # Send the prompt to the OpenAI API
    response = openai.Completion.create(
        engine="text-davinci-003", 
        prompt=prompt,
        temperature=temperature,
        max_tokens=max_tokens,
        n=1,
        stop=None,  
    )

    generated_code = response['choices'][0]['text']

    return generated_code


def fetch_jira(key,type) :
    
    jira_base_url = "https://pypilot.atlassian.net"
    username = "k.developer.x@gmail.com"
    api_token = "ATATT3xFfGF0H9Tt5bG1Uq3yPdAwQbmycyu9CvcYqXosYjkGLOwcdSLqBDsjeIaD_8QeerAqOyDCEsxR0fIfJ6i2k58c7zwHMouIjdXpofYgZk69tfRr1ASVkVmWrauHru940z8m3MckeDFvELXCtzq-HK8iREAfdsBI-T0CtirrDA-4z1Uhsaw=9B4BF8C0"

    url=f"{jira_base_url}/rest/api/3/search"
    headers={
    "Accept": "application/json",
        "Content-Type": "application/json"
    }

    query = {
    'jql': 'project = XYZKEY'
    }

    response=requests.get(url,headers=headers,params=query,auth=(username,api_token))
    data=response.json()
    issues=data["issues"]
    story = ""

    
    for issue in issues:
        if type == "J": 
            if issue['fields']['issuetype']['name'] == 'Story':
                story += f"\n// Story -  {issue['key']} : {issue['fields']['summary']} -G"
            else : 
              continue
        else : 
            if issue['key'] == key :
                story = f"\n// Story : {issue['fields']['summary']} -G"
                break
            else : 
                story = "Not found with this key!"

            
    return story


    

    


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('Usage: python pythonScript.py "<input_string>"')
        sys.exit(1)

    input_string = sys.argv[1]
    input_string = input_string.strip()
    if input_string.endswith('-J') :
        result = fetch_jira(input_string,"J")
    elif input_string.endswith('-G') : 
        result = complete_code(input_string)
    elif input_string.endswith('-S') : 
        matches = re.findall(r'\[(.*?)\]', input_string)
        if matches:
            key = matches[0]
            result = fetch_jira(key.strip(),"S")
        else:
            print("Not found the Key")
    else : 
        result = ""

    print('\n'+result)
