<?php

declare(strict_types=1);

namespace App\ArticleComments;

use App\Database\DB;

class ArticleComments
{
    private $db;
    private $tableName = 'coments_for_articles';

    public function __construct()
    {
        $this->db = new DB();
    }

    public function addComment($comment, $userID, $articleID)
    {
        if ($this->db->addArticleComment($comment, $userID, $articleID)) {
            return $this->db->getCommentsForArticle($articleID);
        }
    }

    public function deleteComment($id, $articleID)
    {
        $this->db->deleteFromTable($this->tableName, 'id', $id);
        return $this->db->getCommentsForArticle($articleID);
    }
}