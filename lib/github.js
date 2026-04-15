async function updateFile(path, content, message) {
  const GITHUB_TOKEN  = process.env.GITHUB_TOKEN;
  const GITHUB_OWNER  = process.env.GITHUB_OWNER; 
  const GITHUB_REPO   = process.env.GITHUB_REPO;
  const GITHUB_BRANCH = 'main';

  const getUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
  
  const existing = await fetch(getUrl, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  let sha = undefined;
  if (existing.ok) {
    const data = await existing.json();
    sha = data.sha;
  }

  const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');

  const body = {
    message,
    content: encoded,
    branch:  GITHUB_BRANCH,
    ...(sha ? { sha } : {}),
  };

  const response = await fetch(getUrl, {
    method:  'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept:        'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`GitHub update failed: ${err}`);
  }

  return await response.json();
}

module.exports = { updateFile };