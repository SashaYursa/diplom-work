<?php

declare(strict_types=1);

use App\Account\User;
use App\Articles\Articles;

$method = $_SERVER['REQUEST_METHOD'];
$headers = getallheaders();
if (isset($headers['Status'])) {
    $headers['status'] = $headers['Status'];
}
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $user = new User();
    if (isset($headers['Status'])) {
        if ($headers['Status'] === 'add-article') {
            echo json_encode(["123" => 1234]);
        }
    }
}
if ($method === 'GET') {
    $article = new Articles();
    if (isset($headers['status'])) {
        if ($headers['status'] === 'get-user-articles') {
            $res = $article->getUserArticles(
                $_GET['id'],
                $_GET['limit'],
                $_GET['offset'],
                $_GET['order'],
                $_GET['orderType']
            );
            echo json_encode($res);
        }
        if ($headers['status'] === 'get-for-article-page') {
            $res = $article->getArticleWithComments($_GET['id']);
            echo json_encode($res);
        }
        if ($headers['status'] === 'get-another-articles') {
            $res = $article->getLastArticles($_GET['limit'], $_GET['offset']);
            echo json_encode($res);
        }
        if ($headers['status'] === 'get-categories') {
            $res = $article->getCategories();
            echo json_encode($res);
        }
        if ($headers['status'] === 'get-most-popular') {
            $articlesPack = $article->getPacketArticle(20, 0, 'views', 0);
            echo json_encode($articlesPack);
        }
        return;
    }
    if (isset($_GET['offset']) and isset($_GET['limit']) and isset($_GET['sortType']) and isset($_GET['categories'])) {
        $articlesPack = $article->getPacketArticle(
            $_GET['limit'],
            $_GET['offset'],
            $_GET['sortType'],
            $_GET['categories']
        );
        echo json_encode($articlesPack);
    }

    if (isset($_GET['id']) and isset($_GET['uid'])) {
        $article = $article->getArticle($_GET['id']);
        if (!$article) {
            echo json_encode($article);
            return;
        }
        if (intval($article['author_id']) !== intval($_GET['uid'])) {
            echo json_encode(false);
        } else {
            echo json_encode($article);
        }
        //if ($article[])
    }
}
if ($method === 'DELETE') {
    if (isset($_GET['id']) and isset($_GET['userID'])) {
        $article = new Articles();
        $res = $article->deleteArticle($_GET['id'], $_GET['userID']);
        echo json_encode($res);
    }
    //echo json_encode(['123' => $_GET]);
}
if ($method === 'PATCH') {
    if (isset($headers['status'])) {
        if ($headers['status'] === 'add-like') {
            if (isset($_GET['id']) and isset($_GET['uid'])) {
                $article = new Articles();
                $res = $article->setLike($_GET['id'], $_GET['uid']);
                echo json_encode($res);
            }
        }
    }
}