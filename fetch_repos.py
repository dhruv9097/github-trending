import requests
from bs4 import BeautifulSoup
import pandas as pd
import json
from datetime import datetime
import os

def fetch_today_trending():
    url = "https://github.com/trending?since=daily"
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        
        repos_data = []
        articles = soup.find_all('article', class_='Box-row')

        for article in articles:
            # 1. Extract Repo Name
            repo_link = article.find('h2', class_='h3').find('a')
            full_name = repo_link.text.strip().replace(' ', '').replace('\n', '')
            
            # 2. Extract Description
            desc_tag = article.find('p', class_='col-9')
            description = desc_tag.text.strip() if desc_tag else "No description provided."
            
            # 3. Extract Stars Gained Today
            stars_today_tag = article.find('span', class_='d-inline-block float-sm-right')
            if stars_today_tag:
                # cleans "1,234 stars today" -> "1234"
                stars_today_text = stars_today_tag.text.strip().split(' ')[0].replace(',', '')
                stars_today = int(stars_today_text)
            else:
                stars_today = 0

            # 4. Calculate Hype Score (MUST BE DONE HERE)
            # Hype = Daily Stars * 1.25 (125% of raw growth)
            hype_score = int(stars_today * 1.25)

            # 5. Append to List
            repos_data.append({
                "name": full_name,
                "description": description,
                "stars_today": f"{stars_today:,}",  # Formatted string "1,654"
                "hype_score": hype_score,           # Integer 2067
                "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })

        # --- SAVE TO CSV ---
        save_path = '/Users/dhruv/Documents/github-dashboard/public/data.csv'
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        df = pd.DataFrame(repos_data)
        df.to_csv(save_path, index=False)

        # --- BOT SUMMARY ---
        summary = {
            "status": "success",
            "repos_found": len(repos_data),
            "top_hype_repo": repos_data[0]['name'] if repos_data else "None",
            "top_hype_score": repos_data[0]['hype_score'] if repos_data else 0,
            "timestamp": datetime.now().strftime("%H:%M:%S")
        }
        print(f"---SYNC_COMPLETE---")
        print(json.dumps(summary, indent=2))

    except Exception as e:
        error_summary = {"status": "error", "message": str(e)}
        print(json.dumps(error_summary))

if __name__ == "__main__":
    fetch_today_trending()