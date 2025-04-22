# The main script to run. Make sure to specify the correct date range and verbosity level.

import argparse
from one_day_generator import generate_and_save_content
from json_to_server_poster import post_content

if __name__ == "__main__":
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Generate and post daily content.")
    parser.add_argument("--d", type=int, help="Range of days to generate content for (default: 1)")
    parser.add_argument("--production", action="store_true", help="Use the production deployment API")
    parser.add_argument("--verbose", action="store_true", help="Enable verbose output")
    args = parser.parse_args()

    # Generate and save content
    date_range = args.d if args.d else 1
    print(f"Generating content for {date_range} day(s). This takes around {date_range + 1} minutes.")
    generate_and_save_content(date_range, args.verbose)

    # Post content to server
    isDeployment = args.production
    if isDeployment:
        print("Posting content to production deployment API.")
    else:
        print("Posting content to local development API.")
    post_content(date_range, args.verbose, isDeployment)
