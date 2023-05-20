<?php

declare(strict_types=1);

use App\Account\User;
use App\ArticleComments\ArticleComments;

$method = $_SERVER['REQUEST_METHOD'];
$headers = getallheaders();
if (isset($headers['Status'])) {
    $headers['status'] = $headers['Status'];
}
$articleComment = new ArticleComments();
if ($method === 'POST') {
    if (isset($headers['status'])) {
        if ($headers['status'] === 'add-comment') {
            $user = new User();
            $checkUser = $user->validateValue('user_token', $_POST['userToken']);
            if ($checkUser) {
                $userID = $user->getUser('user_token', $_POST['userToken'])['id'];

                $comments = $articleComment->addComment($_POST['comment'], $userID, $_POST['articleID']);
                echo json_encode($comments);
            }
        }
    }
}
if ($method === 'DELETE') {
    if (isset($_GET['id']) and isset($_GET['articleID'])) {
        $comments = $articleComment->deleteComment($_GET['id'], $_GET['articleID']);
        echo json_encode($comments);
    }
}