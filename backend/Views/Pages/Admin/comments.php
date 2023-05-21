<?php

declare(strict_types=1);

use App\Account\User;
use App\ArticleComments\ArticleComments;

$method = $_SERVER['REQUEST_METHOD'];
$headers = getallheaders();
if (isset($headers['Status'])) {
    $headers['status'] = $headers['Status'];
}
if (isset($headers['Limit'])) {
    $headers['limit'] = $headers['Limit'];
}
if (isset($headers['Offset'])) {
    $headers['offset'] = $headers['Offset'];
}
if ($method === 'GET') {
    $user = new User();
    $comments = new ArticleComments();
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($headers['limit']) and isset($headers['offset']) and isset($_GET['userAccess'])) {
        $limit = intval($headers['limit']);
        $offset = intval($headers['offset']);
        $userAdminStatus = $_GET['userAccess'];
        $comments = $comments->getPacketCommentsForAdmin($offset, $limit);

        $i = 0;
        foreach ($comments as $val) {
            $comments[$i]['editable'] = true;
            if ($val['is_admin'] == 2) {
                $comments[$i]['editable'] = false;
            }
            $i++;
        }

        echo json_encode(['comments' => $comments]);
    }
    if (isset($headers['status'])) {
        if ($headers['status'] === 'get-count-pages') {
            $items = $comments->getPages();
            $pages = ceil($items['count'] / $_GET['itemsInPage']);
            echo json_encode(['pages' => $pages, 'items' => $items['count']]);
        }
        if ($headers['status'] === 'get-comment' and isset($_GET['id'])) {
            $comment = $comments->getComment($_GET['id']);
            echo json_encode(['comment' => $comment]);
        }
    }
}
if ($method === 'POST') {
    $user = new User();
    if ($headers['status'] === 'update-image') {
        $newImage = $_FILES['image'];
        $res['image'] = $user->saveUserImage($newImage, $_POST['userID']);
        echo json_encode($res);
    }
}
if ($method === 'DELETE') {
    $id = intval($_GET['id']);
    $comments = new ArticleComments();
    $res = $comments->deleteCommentByAdmin($id);
    echo json_encode(['status' => true, 'res' => $res]);
}
if ($method === 'PATCH') {
    $data = json_decode(file_get_contents('php://input'), true);
    $commentID = $data['commentID'];
    $commentText = $data['data'];
    $comment = new ArticleComments();
    $res = [];
    if ($headers['status'] === 'update-comment') {
        $res = $comment->updateComment($commentID, $commentText);
    }
    echo json_encode(['success' => $res]);
}
