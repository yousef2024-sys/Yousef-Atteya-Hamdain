import logging
import sys


def setup_logging() -> None:
    """Configure a simple, consistent logging format for the whole app."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        stream=sys.stdout,
    )
