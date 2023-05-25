<?php

declare(strict_types=1);

use App\Links\Links;

$method = $_SERVER['REQUEST_METHOD'];
$headers = getallheaders();
if (isset($headers['Status'])) {
    $headers['status'] = $headers['Status'];
}
$links = new Links();
if ($method === 'GET') {
    $links = $links->getLinks();
    echo json_encode($links);
}
if ($method === 'PATCH') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['name']) and isset($data['link'])) {
        $res = $links->updateLinks($data['name'], $data['link']);
        echo json_encode($res);
    }
}