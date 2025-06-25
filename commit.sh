#!/usr/bin/env bash
# =============================================================
#  一檔一 Commit 自動產生腳本
#  ── 進階版：
#     • 若檔案數 ≥ 天數：
#          先『一天一檔』填滿，再把剩餘檔案隨機落在整段日期內。
#     • 若檔案數 < 天數：
#          以「最平均」的間隔分佈整段期間（頭尾一定落到起迄日期）。
# =============================================================
#  使用：
#    • 直接以 Bash 執行：bash commit.sh
#    • 或先賦權後執行：chmod +x commit.sh && ./commit.sh
# =============================================================

set -euo pipefail

# ---------- 使用者可調整 ----------
start_date="2025-06-23"   # 起始日期（含）
end_date="2025-06-25"     # 結束日期（含）
MSG_PREFIX="Add"          # commit 訊息前綴
EXTRA_EXCLUDE=( "*.log" ".env.local" ) # 排除 .log 與 .env.local # 其他要排除的樣式
# ----------------------------------

for cmd in git date shuf; do
  command -v "$cmd" >/dev/null 2>&1 || {
    echo "[錯誤] 需要 '$cmd' 指令，請安裝或改用 WSL / Git Bash。" >&2; exit 1; }
done

# -------- 日期轉 timestamp --------
start_ts=$(date -d "$start_date" +%s)
end_ts=$(date -d "$end_date" +%s)
range_ts=$((end_ts - start_ts))

days_span=$(( range_ts / 86400 + 1 ))   # 含首尾天數

# -------- 建立檔案清單 --------
FIND_CMD=(find . -type f ! -path "./.git/*" ! -name "*.sh" )
for pat in "${EXTRA_EXCLUDE[@]}"; do FIND_CMD+=( ! -name "$pat" ); done
mapfile -t files < <("${FIND_CMD[@]}")
file_count=${#files[@]}

(( file_count == 0 )) && { echo "[結束] 找不到可提交的檔案。"; exit 0; }

# -------- 產生 timestamp 陣列 --------
declare -a timestamps

if (( file_count >= days_span )); then
  # --- 檔案數 ≥ 天數：先一天一檔，其餘隨機 ---
  for ((i=0; i<days_span; i++)); do timestamps[i]=$(( start_ts + i*86400 )); done
  extra=$(( file_count - days_span ))
  if (( extra > 0 )); then
    mapfile -t rand_off < <(shuf -i 0-$range_ts -n $extra)
    for ((j=0; j<extra; j++)); do timestamps[days_span+j]=$(( start_ts + rand_off[j] )); done
  fi
else
  # --- 檔案數 < 天數：平均分佈 ---
  if (( file_count == 1 )); then
    timestamps[0]=$start_ts
  else
    step=$(( range_ts / (file_count - 1) ))
    for ((i=0; i<file_count; i++)); do timestamps[i]=$(( start_ts + i*step )); done
  fi
fi

# 依時間排序，並確保檔案對應固定索引（穩定排序）
for ((i=0;i<file_count;i++)); do echo "$i:${timestamps[i]}"; done | sort -t: -k2,2n | {
  declare -a tmp
  while IFS=: read -r idx ts; do tmp[idx]=$ts; done
  timestamps=("${tmp[@]}")
}

# -------- 初始化 Git --------
[ -d .git ] || git init

git reset -q   # 清 staging
printf "開始提交，共 %d 個檔案，天數 %d …\n\n" "$file_count" "$days_span"

counter=1
for i in "${!files[@]}"; do
  file="${files[$i]}"
  ts="${timestamps[$i]}"
  commit_date=$(date -d "@$ts" +"%Y-%m-%dT12:00:00")

  git add "$file"
  if git diff --cached --quiet; then git reset "$file" >/dev/null; continue; fi

  commit_hash=$( GIT_AUTHOR_DATE="$commit_date" \
                 GIT_COMMITTER_DATE="$commit_date" \
                 git commit -m "$MSG_PREFIX $file" --date="$commit_date" \
                 --quiet --no-gpg-sign && git rev-parse --short HEAD )

  printf "[%3d/%3d] %s | 日期 %s | hash %s\n" \
         "$counter" "$file_count" "$file" "$commit_date" "$commit_hash"
  ((counter++))
done

echo -e "\n全部完成！共提交 $((counter-1)) 筆。"
