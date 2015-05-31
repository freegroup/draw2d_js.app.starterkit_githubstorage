/**
 * @class RubberConnection
 * 
 * A simple bee line connection with a rubber band rendering
 *
 * @author Andreas Herz
 * @extend draw2d.Connection
 */
var RubberConnection= draw2d.Connection.extend({

    NAME: "RubberConnection",

    init:function(attr)
    {
      this._super(attr);
      this.setColor("#33691e");
      
      this.setRouter(new draw2d.layout.connection.RubberbandRouter());
    },
    
    repaint:function(attributes){
        if (this.repaintBlocked===true || this.shape === null){
            return;
        }

        attributes= attributes || {};
        
        if(typeof attributes.fill === "undefined"){
        	   attributes.fill = "#aed581";
         }

        this._super(attributes);
    }
});
