import requests
from bs4 import BeautifulSoup

def get_latest_movies():
    url = "https://www.sinhalasub.lk"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    movies = []
    for post in soup.select(".post"):
        title_tag = post.select_one(".post-title")
        link_tag = post.find("a")
        if title_tag and link_tag:
            title = title_tag.text.strip()
            link = link_tag["href"]
            movies.append({"title": title, "link": link})
    return movies

# Message handler
def handle_message(message, chat_id):
    if message.lower() == "latest":
        movies = get_latest_movies()
        if movies:
            reply = "\n\n".join([f"{m['title']}\n{m['link']}" for m in movies[:5]])
        else:
            reply = "Movie list එක ලබාගත නොහැක."
        send_whatsapp_message(chat_id, reply)

# WhatsApp simulation
def send_whatsapp_message(chat_id, text):
    print(f"[To {chat_id}]: {text}")
