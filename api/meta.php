<?php
require __DIR__ . '/_lib.php';
require_auth();
$tok = (string) cfg('META_ACCESS_TOKEN', ''); $acct = preg_replace('/\D/', '', (string) cfg('META_AD_ACCOUNT_ID', ''));
if ($tok === '' || $acct === '') fail('Meta Ads não configurado (META_ACCESS_TOKEN e META_AD_ACCOUNT_ID)', 503);
$since = $_GET['since'] ?? date('Y-m-d', strtotime('-30 days')); $until = $_GET['until'] ?? date('Y-m-d');
foreach ([$since, $until] as $d) if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $d)) fail('Datas devem ser AAAA-MM-DD', 422);
$url = 'https://graph.facebook.com/v21.0/act_' . $acct . '/insights?' . http_build_query(['fields' => 'spend,impressions,clicks,actions', 'time_increment' => 1, 'limit' => 100, 'time_range' => json_encode(['since' => $since, 'until' => $until])]);
$days = []; $pages = 0;
while ($url && $pages++ < 5) {
    [$code, $j, $raw] = http_json($url, ['Authorization: Bearer ' . $tok], null, 40);
    if ($code !== 200 || !is_array($j)) fail('Meta: ' . substr((string) (($j['error']['message'] ?? $raw)), 0, 300), 502);
    foreach (($j['data'] ?? []) as $r) {
        $leads = 0; foreach (($r['actions'] ?? []) as $a) if (in_array($a['action_type'] ?? '', ['lead', 'onsite_conversion.lead_grouped', 'offsite_conversion.fb_pixel_lead'], true)) $leads += (int) $a['value'];
        $days[] = ['date' => $r['date_start'], 'spend' => (float) ($r['spend'] ?? 0), 'impressions' => (int) ($r['impressions'] ?? 0), 'clicks' => (int) ($r['clicks'] ?? 0), 'leads' => $leads];
    }
    $url = $j['paging']['next'] ?? null;
    if ($url && strpos($url, 'https://graph.facebook.com/') !== 0) $url = null;
}
json_out(['ok' => true, 'days' => $days]);
