export interface IfcRoonZoneApi {
  zone_id: string;
  display_name: string;
  outputs: [
    {
      output_id: string;
      zone_id: string;
      can_group_with_output_ids: string[];
      display_name: string;
      volume: {
        type: string;
        min: number;
        max: number;
        value: number;
        step: number;
        is_muted: boolean;
        hard_limit_min: number;
        hard_limit_max: number;
        soft_limit: number;
      };
      source_controls: [
        {
          control_key: string;
          display_name: string;
          supports_standby: boolean;
          status: string;
        }
      ];
    }
  ];
  state: string;
  is_next_allowed: boolean;
  is_previous_allowed: boolean;
  is_pause_allowed: boolean;
  is_play_allowed: boolean;
  is_seek_allowed: boolean;
  queue_items_remaining: number;
  queue_time_remaining: number;
  settings: {
    loop: string;
    shuffle: boolean;
    auto_radio: boolean;
  };
  now_playing: {
    seek_position: number;
    length: number;
    one_line: {
      line1: string;
    };
    two_line: {
      line1: string;
      line2: string;
    };
    three_line: {
      line1: string;
      line2: string;
      line3: string;
    };
    image_key: string;
    artist_image_keys: string[];
  };
}


export var initZone:IfcRoonZoneApi = {
    "zone_id": "",
    "display_name": "",
    "outputs": [
      {
        "output_id": "",
        "zone_id": "",
        "can_group_with_output_ids": [
          ""
        ],
        "display_name": "",
        "volume": {
          "type": "", //"number",
          "min": 0,
          "max": 0,
          "value": 0,
          "step": 1,
          "is_muted": false,
          "hard_limit_min": 0,
          "hard_limit_max": 0,
          "soft_limit": 0
        },
        "source_controls": [
          {
            "control_key": "",
            "display_name": "",
            "supports_standby": false,
            "status": ""
          }
        ]
      }
    ],
    "state": "paused",
    "is_next_allowed": false,
    "is_previous_allowed": false,
    "is_pause_allowed": false,
    "is_play_allowed": false,
    "is_seek_allowed": false,
    "queue_items_remaining": 0,
    "queue_time_remaining": 0,
    "settings": {
      "loop": "disabled",
      "shuffle": false,
      "auto_radio": false
    },
    "now_playing": {
      "seek_position": 0,
      "length": 0,
      "one_line": {
        "line1": ""
      },
      "two_line": {
        "line1": "",
        "line2": ""
      },
      "three_line": {
        "line1": "",
        "line2": "",
        "line3": ""
      },
      "image_key": "",
      "artist_image_keys": [
        ""
      ]
    }
  }


