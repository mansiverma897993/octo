const list = document.getElementById('list');

async function api(path, method='GET') {
  const token = document.getElementById('token').value.trim();
  const project = document.getElementById('project').value.trim();
  const res = await fetch(`/api/commands${path}`, {
    method,
    headers: {
      'authorization': `Bearer ${token}`,
      'x-project-slug': project,
      'content-type': 'application/json'
    }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function load() {
  try {
    const data = await api('/approval?status=PENDING&limit=50');
    list.innerHTML = '';
    for (const a of data.approvals) {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `<b>${a.intent.intent.action}</b><br/><small>${a.id}</small><div class='actions'><button data-id='${a.id}' data-act='approve'>Approve</button><button data-id='${a.id}' data-act='reject'>Reject</button></div>`;
      list.appendChild(div);
    }
  } catch (e) {
    list.innerHTML = `<div class='card'>${e.message}</div>`;
  }
}

document.getElementById('load').onclick = load;
list.onclick = async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  await api(`/approval/${btn.dataset.id}/${btn.dataset.act}`, 'POST');
  await load();
};
