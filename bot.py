import requests
from bs4 import BeautifulSoup

def scrape_sinhalasub_movies():
    url = "https://sinhalasub.lk/"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    movies = []
    posts = soup.select('.post')

    for post in posts:
        title_tag = post.select_one('.post-title')
        link_tag = post.find('a')

        if title_tag and link_tag:
            title = title_tag.text.strip()
            link = link_tag['href']
            movies.append({
                "title": title,
                "url": link
            })
    return movies

def handle_message(message, chat_id):
    if message.lower() == "movies":
        movies = scrape_sinhalasub_movies()
        if movies:
            reply = ""
            for m in movies[:5]:
                reply += f"{m['title']}\n{m['url']}\n\n"
        else:
            reply = "Movies list එක ලබාගත නොහැක."
        send_whatsapp_message(chat_id, reply)
    else:
        send_whatsapp_message(chat_id, "ඔබට 'movies' කියලා ටයිප් කරන්න පුළුවන්.")

def send_whatsapp_message(chat_id, text):
    # මෙතන ඔයාගේ WhatsApp API call එකට වෙනස් කරන්න
    print(f"To {chat_id}: {text}")

# Testing purpose එකට
if __name__ == "__main__":
    test_chat_id = "123456"
    test_message = "movies"
    handle_message(test_message, test_chat_id)
