#!/usr/bin/env python3
"""
Atualiza o campo 'Execução' (Todo | In Progress | In Review | Done) de uma Issue
no GitHub Project #1 (Valimenta's Board).
Uso: python3 update_board.py <ISSUE_NUMBER> "<STATUS>"
"""
import json
import subprocess
import sys
import urllib.request

PROJECT_ID = "PVT_kwHODB8p6c4Bi5oO"
EXECUCAO_FIELD_ID = "PVTSSF_lAHODB8p6c4Bi5oOzhq-4fQ"


def get_token():
    proc = subprocess.run(["gh", "auth", "token"], text=True, capture_output=True)
    if proc.returncode != 0 or not proc.stdout.strip():
        raise RuntimeError("Execute 'gh auth login' e 'gh auth refresh -s project'.")
    return proc.stdout.strip()


def graphql(token, query, variables=None):
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    req = urllib.request.Request(
        "https://api.github.com/graphql",
        data=json.dumps(payload).encode("utf-8"),
        method="POST",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "User-Agent": "Valimenta-Skill-Board-Updater",
        },
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        res = json.loads(resp.read().decode("utf-8"))
    if "errors" in res:
        raise RuntimeError(f"GraphQL error: {res['errors']}")
    return res["data"]


def main():
    if len(sys.argv) < 3:
        print("Uso: python3 update_board.py <ISSUE_NUMBER> '<Todo|In Progress|In Review|Done>'")
        sys.exit(1)

    issue_number = int(sys.argv[1].lstrip("#"))
    target_status = sys.argv[2].strip()
    token = get_token()

    q = """
    query($projectId: ID!) {
      node(id: $projectId) {
        ... on ProjectV2 {
          field(name: "Execução") {
            ... on ProjectV2SingleSelectField {
              id
              options { id name }
            }
          }
          items(first: 100) {
            nodes {
              id
              content {
                ... on Issue {
                  number
                  title
                }
              }
            }
          }
        }
      }
    }
    """
    data = graphql(token, q, {"projectId": PROJECT_ID})["node"]
    field = data["field"]
    opts = {o["name"].lower(): o["id"] for o in field["options"]}
    if target_status.lower() not in opts:
        raise ValueError(f"Status inválido '{target_status}'. Opções: {list(opts.keys())}")

    option_id = opts[target_status.lower()]
    item_id = None
    issue_title = ""
    for item in data["items"]["nodes"]:
        content = item.get("content") or {}
        if content.get("number") == issue_number:
            item_id = item["id"]
            issue_title = content.get("title", "")
            break

    if not item_id:
        raise RuntimeError(f"Issue #{issue_number} não encontrada no Project #1.")

    mut = """
    mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
      updateProjectV2ItemFieldValue(input: {
        projectId: $projectId,
        itemId: $itemId,
        fieldId: $fieldId,
        value: { singleSelectOptionId: $optionId }
      }) {
        projectV2Item { id }
      }
    }
    """
    graphql(token, mut, {
        "projectId": PROJECT_ID,
        "itemId": item_id,
        "fieldId": field["id"],
        "optionId": option_id,
    })
    print(f"[Board] Issue #{issue_number} ({issue_title}) -> Execução = '{target_status}'")


if __name__ == "__main__":
    main()
