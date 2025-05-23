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
