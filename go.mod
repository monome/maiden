module github.com/monome/maiden

go 1.12

require (
	github.com/BurntSushi/toml v0.3.1 // indirect
	github.com/coreos/go-systemd v0.0.0-20181031085051-9002847aa142
	github.com/gin-gonic/gin v1.4.0
	github.com/godbus/dbus v0.0.0-20181101234600-2ff6f7ffd60f // indirect
	github.com/google/gofuzz v0.0.0-20170612174753-24818f796faf // indirect
	github.com/inconshreveable/mousetrap v1.0.0 // indirect
	github.com/monome/maiden/pkg/catalog v0.0.0-00010101000000-000000000000
	github.com/monome/maiden/pkg/dust v0.0.0-00010101000000-000000000000
	github.com/monome/maiden/pkg/lines v0.0.0-00010101000000-000000000000
	github.com/sirupsen/logrus v1.4.1
	github.com/spf13/cobra v0.0.3
	github.com/spf13/viper v1.3.2
	github.com/ugorji/go v1.1.7 // indirect
	golang.org/x/sync v0.0.0-20190227155943-e225da77a7e6 // indirect
)

replace github.com/monome/maiden/pkg/lines => ./pkg/lines

replace github.com/monome/maiden/pkg/catalog => ./pkg/catalog

replace github.com/monome/maiden/pkg/dust => ./pkg/dust
