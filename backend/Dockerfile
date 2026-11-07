FROM python:3.12-slim

ENV UV_PYTHON_DOWNLOADS=never UV_LINK_MODE=copy
RUN pip install --no-cache-dir uv==0.9.3

WORKDIR /app
COPY pyproject.toml uv.lock .python-version ./
RUN uv sync --frozen --no-dev
COPY app ./app

# A new named volume takes its owner from this directory, so the app user can write to /data.
RUN useradd --create-home app && mkdir /data && chown app:app /data
USER app
ENV PATH="/app/.venv/bin:$PATH"

# No CMD: compose supplies the command, because the port comes from BACKEND_PORT.
