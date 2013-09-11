$(document).ready(function() {

    /**
     * Canvas
     */
    window.stage = new Kinetic.Stage({
        container: 'container',
        width: window.stageWidth,
        height: window.stageHeight,
    });
    stage.add(new Kinetic.Layer());

    /**
     * Setting css for ui elements according to scale
     */
    var top = 20;
    var left = 20;

    $('#container').css({
        top: top + 'px',
        left: left + 'px',
        width: window.stageWidth + 'px',
        height: window.stageHeight + 'px'
    });

    $('#main-controls').css({
        top: (window.stageHeight + top) + 'px',
        left: left + 'px',
        width: window.stageWidth + 'px'
    });

    $('#webvfx-collection').css({
        top: top + 'px',
        left: (window.stageWidth + (left * 2)) + 'px'}
    );

    /**
     * Widgets behaviour
     */
    $("#webvfx-collection").sortable({
        cursor: 'move',
        stop: function(event, ui) {
            var total = $('.webvfx-obj').length - 1;
            var index = ui.item.index();
            ui.item.trigger('drop', total - index);
        }
    });
    //$("#webvfx-collection").disableSelection();

    var addText = function() {
        var text = $('#text').val();
        if (text != '') {
            webvfxCollection.new = true;
            webvfxCollection.add(new WebvfxText({text: text}));
            $('#text').val('');
        }
    };

    $('#addText').click(addText);

    $('#text').keyup(function(e) {
        if (e.keyCode == 13) {
            addText();
        }
    });

    $('#files').change(function () {
        processFiles(this.files);
    });

    window.realTimeEdition = false;
    $('#real-time').on('change', function() {
        window.realTimeEdition = $(this).val() == 'yes' ? true : false;
        console.log('real time edition ' + (window.realTimeEdition ? 'on' : 'off'));
    });

    $('#update').click(function() {
        console.log('manual update');
        webvfxCollection.sendAll();
    });

    var dropzone = $('#container');

    dropzone.on('dragover', function() {
        console.log('dragover');
        dropzone.addClass('hover');
        return false;
    });

    dropzone.on('dragleave', function() {
        console.log('dragleave');
        dropzone.removeClass('hover');
        return false;
    });

    dropzone.on('drop', function(e) {
        console.log('drop');
        e.stopPropagation();
        e.preventDefault();
        dropzone.removeClass('hover');
        var files = e.originalEvent.dataTransfer.files;
        processFiles(files);
        return false;
    });

    //* Mouse position
    $(stage.getContent()).on('mousemove', function(event) {
        var pos = stage.getMousePosition();
        var mouseX = parseInt(pos.x / stageScale);
        var mouseY = parseInt(pos.y / stageScale);
        $('#mouse-position').html('(' + mouseX + 'px,' + mouseY + 'px)');
    });
    //*/

    /**
     * Images upload
     */
    var processFiles = function(files) {
        if (files && typeof FileReader !== "undefined") {
            for (var i = 0; i < files.length; i++) {
                readFile(files[i]);
            }
        }
    };

    var readFile = function(file) {
        if( (/image/i).test(file.type) ) {
            var reader = new FileReader();
            reader.onload = function(e) {
                console.log('loaded ' + file.name);
                uploadImage(file);
                image = new Image();
                image.name = file.name;
                image.type = file.type;
                image.src = e.target.result;
                webvfxCollection.new = true;
                webvfxCollection.add(
                    new WebvfxImage({image: image, name: file.name})
                );
            };
            reader.readAsDataURL(file);
        } else {
            alert('File format not supported');
        }
    };

    // Upload image to server node
    var uploadImage = function(file) {
        var formdata = new FormData();
        formdata.append('uploadedFile', file);
        $.ajax({
            url: 'uploadImage',
            type: 'POST',
            data: formdata,
            processData: false,
            contentType: false,
            success: function(res) {
                console.log('uploaded ' + file.name);
            }
        });
    };

    /**
     * Webvfx Objects List
     */
    window.webvfxCollection = new WebvfxCollection();

    var webvfxCollectionView = new WebvfxCollectionView(webvfxCollection);

});

// vim: set foldmethod=indent foldlevel=1 foldnestmax=2 :