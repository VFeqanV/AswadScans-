<?php defined("ABSPATH") || die("!");
extract($args); 
$name = apply_filters('widget_title', $instance['name']);
?>

<?php echo $before_widget; ?>

<?php if (!empty($name)) {
    echo $before_title . $name . $after_title;
} ?>

<div class="textwidget custom-html-widget">
<div id="theHISTORY"></div>
</div>

<?php echo $after_widget; ?>
