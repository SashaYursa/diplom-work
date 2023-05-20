<?php

declare(strict_types=1);

use App\Account\User;
use App\Articles\Articles;

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
    $article = new Articles();
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($headers['limit']) and isset($headers['offset']) and isset($_GET['userAccess'])) {
        $limit = intval($headers['limit']);
        $offset = intval($headers['offset']);
        $userAdminStatus = $_GET['userAccess'];
        $res = $article->getArticlesWithLimitForAdmin($offset, $limit);
        echo json_encode(['articles' => $res]);
    }
    if (isset($headers['status'])) {
        if ($headers['status'] === 'get-count-pages') {
            $items = $article->getPages();
            $pages = ceil($items['count'] / $_GET['itemsInPage']);
            echo json_encode(['pages' => $pages, 'items' => $items['count']]);;
        }

        if ($headers['status'] === 'get-article') {
            if (isset($_GET['id'])) {
                $user = new User();
                $res = $article->getArticleForEdit($_GET['id'], $user);
                echo json_encode($res);
            }
        }
    }
}
if ($method === 'POST') {
//    if (isset($headers['status'])) {
//        if ($headers['status'] === 'update-portfolio-item') {
//            $itemID = $_POST['itemID'];
//            if (isset($_POST['workName'])) {
//                $art->editArt('name', $_POST['workName'], $itemID);
//            }
//            if (isset($_POST['workDesc'])) {
//                $art->editArt('description', $_POST['workDesc'], $itemID);
//            }
//            foreach ($_FILES as $image) {
//                $art->addPortfolioImage($itemID, $image);
//            }
//            $result = ['res' => true];
//            echo json_encode($result);
//        }
//    }
}
if ($method === 'DELETE') {
    if (isset($headers['status'])) {
        $id = intval($_GET['id']);
        $article = new Articles();
        if ($headers['status'] === 'delete-article') {
            // зробити видалення лише тоді коли видаляє адмін, перевіряти по id
            $res = $article->deleteArticlefromAdmin($id);
            echo json_encode($res);
        }
    }
}
if ($method === 'PATCH') {
    $article = new Articles();
    if (isset($headers['status'])) {
        $data = json_decode(file_get_contents('php://input'), true);
        if ($headers['status'] === 'update-status') {
            echo json_encode($article->updateStatus($data['articleID'], $data['status']));
        }
    }
}
