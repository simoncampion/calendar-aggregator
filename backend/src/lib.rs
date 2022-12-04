use std::error::Error;

use chrono::Utc;
use extractors::{
    largest_element_with_single_date::LargestElementWithSingleDateExtractor, EventExtractor,
};
use models::Event;
use reqwest::Url;

pub mod cache;
pub mod extractors;
pub mod repository;
pub mod models;

async fn get(url: Url) -> Result<String, reqwest::Error> {
    reqwest::get(url).await?.text().await
}

pub async fn extract(url: &str) -> Result<Vec<Event>, Box<dyn Error>> {
    let mut fully_specified_url: String = url.to_string();
    if !url.starts_with("http") {
        fully_specified_url = format!("http://{}", url);
    }
    let url_parsed = Url::parse(&fully_specified_url)?;
    let html = get(url_parsed).await?;
    Ok(LargestElementWithSingleDateExtractor::html_to_events(
        &html,
        &Utc::now().naive_utc().date(),
    ))
}
