use std::{fs, path::PathBuf};

use default_extractor::extractors::{smallest_div_with_date::SmallestDivWithDateExtractor, EventExtractor};

#[test]
fn test_no_events_from_google_landing_page() {
  let test_response = get_test_response("google.html");
  println!("{}", test_response);

  let results = SmallestDivWithDateExtractor::code_to_events(&test_response);
  assert!(results.is_empty());
}

#[test]
fn test_some_events_from_theater_essen() {
  let test_response = get_test_response("theater-essen.html");

  let results = SmallestDivWithDateExtractor::code_to_events(&test_response);
  assert!(10 < results.len());
  assert!(results.len() < 70);
}

#[test]
fn test_some_events_from_ruhr_museum() {
  let test_response = get_test_response("ruhr-museum.html");

  let results = SmallestDivWithDateExtractor::code_to_events(&test_response);
  assert!(10 < results.len());
  assert!(results.len() < 70);
}

fn get_test_response(name: &str) -> String {
  let mut d = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
  d.push("tests/test_responses/");
  d.push(name);

  fs::read_to_string(d).unwrap()
}