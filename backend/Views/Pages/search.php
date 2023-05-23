<?php

declare(strict_types=1);

use App\Account\User;
use App\Art\Art;
use App\Articles\Articles;

$method = $_SERVER['REQUEST_METHOD'];
$headers = getallheaders();
if (isset($headers['Status'])) {
    $headers['status'] = $headers['Status'];
}
if ($method === 'GET') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (isset($_GET['value']) and isset($_GET['params'])) {
        $searchValue = $_GET['value'];
        $searchResponse = [];
        $params = explode(" ", $_GET['params']);
        foreach ($params as $key => $param) {
            if ($param === 'users') {
                $user = new User();
                $searchResponse['users'] = $user->search($searchValue);
            }
            if ($param === 'articles') {
                $article = new Articles();
                $searchResponse['articles'] = $article->search($searchValue);
            }
            if ($param === 'works') {
                $art = new Art();
                $searchResponse['works'] = $art->search($searchValue);
            }
        }
        echo json_encode($searchResponse);
    }
}